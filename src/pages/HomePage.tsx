import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getDocuments,
  getCategories,
  getDocumentStats,
  searchDocuments,
  deleteDocument,
  deleteFile,
  createSystemLog,
} from '@/db/api';
import type { BookDocument, Category, DocumentStats } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, FileText, BookOpen, FolderOpen, Plus, Edit, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import UploadDocumentDialog from '@/components/documents/UploadDocumentDialog';
import EditDocumentDialog from '@/components/documents/EditDocumentDialog';
import { getSignedUrl } from '@/db/api';

export default function HomePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<BookDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<BookDocument | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<BookDocument | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsData, catsData, statsData] = await Promise.all([
        getDocuments(50, 0, selectedCategory || undefined),
        getCategories(),
        getDocumentStats(),
      ]);
      setDocuments(docsData);
      setCategories(catsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setLoading(true);
    try {
      const results = await searchDocuments(searchQuery);
      setDocuments(results);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (doc: BookDocument) => {
    if (doc.file_type === 'pdf') {
      navigate(`/pdf-reader/${doc.id}`);
    } else {
      navigate(`/text-reader/${doc.id}`);
    }
  };

  const handleEdit = (doc: BookDocument) => {
    setSelectedDocument(doc);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (doc: BookDocument) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      await deleteFile(documentToDelete.file_path);
      await deleteDocument(documentToDelete.id);
      await createSystemLog('delete_document', {
        document_id: documentToDelete.id,
        title: documentToDelete.title,
      });
      toast.success('Document deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = async (doc: BookDocument) => {
    try {
      const signedUrl = await getSignedUrl(doc.file_path);
      if (signedUrl) {
        const link = window.document.createElement('a');
        link.href = signedUrl;
        link.download = `${doc.title}.${doc.file_type}`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        await createSystemLog('download_document', {
          document_id: doc.id,
          title: doc.title,
        });
        toast.success('Download started');
      }
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const isAdmin = profile?.role === 'admin';

  // Debug logging
  useEffect(() => {
    console.log('HomePage - User Profile:', {
      email: profile?.email,
      role: profile?.role,
      isAdmin,
    });
  }, [profile, isAdmin]);

  return (
    <div className="container py-8 space-y-8">
      {/* Stats Bar */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_documents || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_categories || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recent_uploads || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, author, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
            {isAdmin && (
              <Button 
                onClick={() => {
                  console.log('Add Document button clicked');
                  setUploadDialogOpen(true);
                }}
                className="whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            )}
            {!isAdmin && (
              <div className="text-sm text-muted-foreground">
                Admin access required to upload documents
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Library</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader onClick={() => handleDocumentClick(doc)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                      <CardDescription className="mt-1">{doc.author}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {doc.file_type.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent onClick={() => handleDocumentClick(doc)}>
                  <div className="space-y-2">
                    {doc.category && (
                      <Badge variant="outline">{doc.category.name}</Badge>
                    )}
                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                      {doc.pages && <span>{doc.pages} pages</span>}
                    </div>
                  </div>
                </CardContent>
                {isAdmin && (
                  <div className="px-6 pb-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(doc);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc);
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(doc);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {isAdmin && (
        <>
          <UploadDocumentDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            onSuccess={loadData}
            categories={categories}
          />
          {selectedDocument && (
            <EditDocumentDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              document={selectedDocument}
              categories={categories}
              onSuccess={loadData}
            />
          )}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
