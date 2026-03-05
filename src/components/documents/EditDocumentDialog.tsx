import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocument, createSystemLog } from '@/db/api';
import type { BookDocument, Category } from '@/types';
import { toast } from 'sonner';

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: BookDocument;
  categories: Category[];
  onSuccess: () => void;
}

export default function EditDocumentDialog({
  open,
  onOpenChange,
  document,
  categories,
  onSuccess,
}: EditDocumentDialogProps) {
  const [title, setTitle] = useState(document.title);
  const [author, setAuthor] = useState(document.author);
  const [categoryId, setCategoryId] = useState(document.category_id);
  const [description, setDescription] = useState(document.description || '');
  const [authorDetails, setAuthorDetails] = useState(document.author_details || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(document.title);
    setAuthor(document.author);
    setCategoryId(document.category_id);
    setDescription(document.description || '');
    setAuthorDetails(document.author_details || '');
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !author || !categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      await updateDocument(document.id, {
        title,
        author,
        category_id: categoryId,
        description: description || null,
        author_details: authorDetails || null,
      });

      await createSystemLog('edit_document', {
        document_id: document.id,
        title,
      });

      toast.success('Document updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
          <DialogDescription>
            Update document metadata
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={saving}>
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
              disabled={saving}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorDetails">Author Details</Label>
            <Textarea
              id="authorDetails"
              value={authorDetails}
              onChange={(e) => setAuthorDetails(e.target.value)}
              disabled={saving}
              rows={3}
              placeholder="Bio, notes, links, etc."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
