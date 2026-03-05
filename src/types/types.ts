export type UserRole = 'user' | 'admin';
export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type FileType = 'pdf' | 'txt';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  author: string;
  category_id: string;
  description: string | null;
  author_details: string | null;
  file_type: FileType;
  file_path: string;
  file_size: number;
  pages: number | null;
  pdf_text_content: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// Alias for better clarity in code
export type BookDocument = Document;

export interface ReadingProgress {
  user_id: string;
  document_id: string;
  last_page: number;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface DocumentSearchResult extends Document {
  rank?: number;
  snippet?: string;
}

export interface DocumentStats {
  total_documents: number;
  total_categories: number;
  recent_uploads: number;
}
