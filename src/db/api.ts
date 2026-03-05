import { supabase } from './supabase';
import type {
  Profile,
  Category,
  Document,
  ReadingProgress,
  SystemLog,
  SupportTicket,
  DocumentSearchResult,
  DocumentStats,
  FileType,
  TicketStatus,
} from '@/types';

// Profile APIs
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return data;
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return Array.isArray(data) ? data : [];
}

// Category APIs
export async function getCategories(): Promise<Category[]> {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return Array.isArray(data) ? data : [];
}

export async function createCategory(name: string): Promise<Category | null> {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  console.log('Creating category:', { name, slug });
  
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Category creation error:', error);
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data;
}

export async function updateCategory(id: string, name: string): Promise<Category | null> {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  console.log('Updating category:', { id, name, slug });
  
  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Category update error:', error);
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return data;
}

export async function deleteCategory(id: string): Promise<boolean> {
  console.log('Deleting category:', id);
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Category delete error:', error);
    throw new Error(`Failed to delete category: ${error.message}`);
  }

  return true;
}

// Document APIs
export async function getDocuments(
  limit = 50,
  offset = 0,
  categoryId?: string
): Promise<Document[]> {
  let query = supabase
    .from('documents')
    .select('*, category:categories!category_id(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data } = await query;
  return Array.isArray(data) ? data : [];
}

export async function getDocument(id: string): Promise<Document | null> {
  const { data } = await supabase
    .from('documents')
    .select('*, category:categories!category_id(*)')
    .eq('id', id)
    .maybeSingle();

  return data;
}

export async function searchDocuments(query: string): Promise<DocumentSearchResult[]> {
  if (!query.trim()) return [];

  const { data } = await supabase
    .from('documents')
    .select('*, category:categories!category_id(*)')
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,pdf_text_content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  return Array.isArray(data) ? data : [];
}

export async function createDocument(doc: {
  title: string;
  author: string;
  category_id: string;
  description?: string;
  author_details?: string;
  file_type: FileType;
  file_path: string;
  file_size: number;
  pages?: number;
  pdf_text_content?: string;
}): Promise<Document | null> {
  console.log('Creating document in database:', { 
    title: doc.title, 
    file_type: doc.file_type,
    file_path: doc.file_path 
  });
  
  // Ensure file_path doesn't contain any problematic characters
  const sanitizedPath = doc.file_path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
  
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: doc.title,
      author: doc.author,
      category_id: doc.category_id,
      description: doc.description || null,
      author_details: doc.author_details || null,
      file_type: doc.file_type,
      file_path: sanitizedPath,
      file_size: doc.file_size,
      pages: doc.pages || null,
      pdf_text_content: doc.pdf_text_content || null,
    })
    .select('*, category:categories!category_id(*)')
    .maybeSingle();

  if (error) {
    console.error('Database insert error:', error);
    throw new Error(`Failed to create document: ${error.message}`);
  }

  if (!data) {
    console.error('No data returned from insert');
    throw new Error('Failed to create document: No data returned');
  }

  console.log('Document created successfully:', data.id);
  return data;
}

export async function updateDocument(
  id: string,
  updates: Partial<Document>
): Promise<Document | null> {
  console.log('Updating document:', id);
  
  const { data, error } = await supabase
    .from('documents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, category:categories!category_id(*)')
    .maybeSingle();

  if (error) {
    console.error('Document update error:', error);
    throw new Error(`Failed to update document: ${error.message}`);
  }

  console.log('Document updated successfully');
  return data;
}

export async function deleteDocument(id: string): Promise<boolean> {
  console.log('Deleting document:', id);
  
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Document delete error:', error);
    throw new Error(`Failed to delete document: ${error.message}`);
  }

  console.log('Document deleted successfully');
  return true;
}

export async function getDocumentStats(): Promise<DocumentStats> {
  const [totalDocs, categories, recentDocs] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return {
    total_documents: totalDocs.count || 0,
    total_categories: categories.count || 0,
    recent_uploads: recentDocs.count || 0,
  };
}

// Reading Progress APIs
export async function getReadingProgress(
  userId: string,
  documentId: string
): Promise<ReadingProgress | null> {
  const { data } = await supabase
    .from('reading_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('document_id', documentId)
    .maybeSingle();

  return data;
}

export async function saveReadingProgress(
  userId: string,
  documentId: string,
  lastPage: number
): Promise<ReadingProgress | null> {
  const { data } = await supabase
    .from('reading_progress')
    .upsert(
      {
        user_id: userId,
        document_id: documentId,
        last_page: lastPage,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,document_id' }
    )
    .select()
    .maybeSingle();

  return data;
}

// System Log APIs
export async function createSystemLog(
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase.from('system_logs').insert({
    user_id: user?.id || null,
    action,
    details: details || null,
  });
}

export async function getSystemLogs(limit = 100, offset = 0): Promise<SystemLog[]> {
  const { data } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return Array.isArray(data) ? data : [];
}

// Support Ticket APIs
export async function createSupportTicket(
  subject: string,
  message: string
): Promise<SupportTicket | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      subject,
      message,
    })
    .select()
    .maybeSingle();

  return data;
}

export async function getSupportTickets(
  userId?: string,
  limit = 50,
  offset = 0
): Promise<SupportTicket[]> {
  let query = supabase
    .from('support_tickets')
    .select('*, user:profiles!user_id(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data } = await query;
  return Array.isArray(data) ? data : [];
}

export async function updateSupportTicket(
  id: string,
  updates: { status?: TicketStatus; admin_response?: string }
): Promise<SupportTicket | null> {
  const { data } = await supabase
    .from('support_tickets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, user:profiles!user_id(*)')
    .maybeSingle();

  return data;
}

// File Storage APIs
export async function uploadFile(
  file: File,
  path: string
): Promise<{ path: string; url: string } | null> {
  try {
    console.log('Uploading file to storage:', { path, size: file.size, type: file.type });
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from upload');
      return null;
    }

    console.log('File uploaded successfully:', data);

    // For private buckets, we'll use signed URLs when needed
    // Just return the path for now
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, expiresIn);

  if (error || !data) return null;
  return data.signedUrl;
}

export async function deleteFile(path: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from('documents')
    .remove([path]);

  return !error;
}
