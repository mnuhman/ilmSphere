import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadFile, createDocument, createSystemLog } from '@/db/api';
import type { Category, FileType } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { AlertCircle } from 'lucide-react';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  categories: Category[];
}

export default function UploadDocumentDialog({
  open,
  onOpenChange,
  onSuccess,
  categories,
}: UploadDocumentDialogProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [authorDetails, setAuthorDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'txt') {
      toast.error('Only PDF and TXT files are allowed');
      return;
    }

    if (selectedFile.size > 1024 * 1024 * 1024) {
      toast.error('File size must be less than 1GB');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file || !title || !author || !categoryId) {
      const errorMsg = 'Please fill in all required fields';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase() as FileType;
      
      // Sanitize filename: remove all special characters, keep only alphanumeric, dash, underscore, and dot
      const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const sanitizedName = originalName
        .replace(/[^a-zA-Z0-9]/g, '_') // Replace all non-alphanumeric with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .substring(0, 100); // Limit length
      
      // Ensure we have a valid name
      const finalName = sanitizedName || 'document';
      const fileName = `${Date.now()}_${finalName}.${fileType}`;
      const filePath = `documents/${fileName}`;

      console.log('Starting file upload:', { 
        originalFileName: file.name,
        sanitizedFileName: fileName, 
        fileType, 
        fileSize: file.size,
        filePath 
      });
      setProgress(30);
      
      const uploadResult = await uploadFile(file, filePath);
      if (!uploadResult) {
        console.error('File upload failed - no result returned');
        throw new Error('File upload failed. Please check your permissions and try again.');
      }

      console.log('File uploaded successfully:', uploadResult);
      setProgress(60);

      let pdfTextContent: string | null = null;
      let pages: number | null = null;

      // Try to extract PDF text, but don't fail the upload if it doesn't work
      if (fileType === 'pdf') {
        try {
          console.log('Attempting PDF text extraction...');
          const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
            body: { filePath },
          });

          if (error) {
            console.warn('PDF text extraction failed (non-critical):', error);
            toast.warning('PDF uploaded but text extraction failed. Search may be limited.');
          } else if (data) {
            pdfTextContent = data.text;
            pages = data.pages;
            console.log('PDF text extracted successfully:', { pages, textLength: data.text?.length });
          }
        } catch (error) {
          console.warn('PDF text extraction error (non-critical):', error);
          // Continue with upload even if extraction fails
        }
      }

      setProgress(80);

      console.log('Creating document record in database...');
      const createdDoc = await createDocument({
        title,
        author,
        category_id: categoryId,
        description: description || undefined,
        author_details: authorDetails || undefined,
        file_type: fileType,
        file_path: filePath,
        file_size: file.size,
        pages: pages ?? undefined,
        pdf_text_content: pdfTextContent ?? undefined,
      });

      if (!createdDoc) {
        throw new Error('Failed to create document record in database');
      }

      console.log('Document created successfully:', createdDoc.id);

      await createSystemLog('upload_document', {
        title,
        file_type: fileType,
        file_size: file.size,
      });

      setProgress(100);
      toast.success('Document uploaded successfully');
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setTitle('');
      setAuthor('');
      setCategoryId('');
      setDescription('');
      setAuthorDetails('');
      setFile(null);
      setProgress(0);
      setError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a new PDF or TXT document to the library
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={uploading}
              required
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, TXT (Max 1GB)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={uploading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorDetails">Author Details</Label>
            <Textarea
              id="authorDetails"
              value={authorDetails}
              onChange={(e) => setAuthorDetails(e.target.value)}
              disabled={uploading}
              rows={3}
              placeholder="Bio, notes, links, etc."
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
