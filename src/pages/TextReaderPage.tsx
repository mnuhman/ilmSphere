import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDocument, getSignedUrl, searchDocuments, createSystemLog } from '@/db/api';
import type { BookDocument } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Search, BookOpen, Type } from 'lucide-react';
import { toast } from 'sonner';

export default function TextReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState<BookDocument | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [monospace, setMonospace] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const doc = await getDocument(id);
      if (!doc) {
        toast.error('Document not found');
        navigate('/');
        return;
      }

      if (doc.file_type !== 'txt') {
        toast.error('This is not a text document');
        navigate(`/pdf-reader/${id}`);
        return;
      }

      setDocument(doc);

      const signedUrl = await getSignedUrl(doc.file_path);
      if (signedUrl) {
        const response = await fetch(signedUrl);
        const text = await response.text();
        setTextContent(text);
      }
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    try {
      const signedUrl = await getSignedUrl(document.file_path);
      if (signedUrl) {
        const link = window.document.createElement('a');
        link.href = signedUrl;
        link.download = `${document.title}.txt`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        await createSystemLog('download_document', {
          document_id: document.id,
          title: document.title,
        });
        toast.success('Download started');
      }
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await searchDocuments(searchQuery);
      toast.success(`Found ${results.length} results`);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-96 w-full bg-muted" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Document not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Text Viewer */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search in document..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    min={12}
                    max={24}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{fontSize}px</span>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="monospace"
                    checked={monospace}
                    onCheckedChange={setMonospace}
                  />
                  <Label htmlFor="monospace" className="cursor-pointer">
                    Monospace
                  </Label>
                </div>

                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Text Display */}
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <pre
                  className={`whitespace-pre-wrap ${monospace ? 'font-mono' : 'font-sans'}`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                >
                  {textContent}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{document.title}</CardTitle>
              <CardDescription>{document.author}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.category && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Category</h4>
                  <p className="text-sm text-muted-foreground">{document.category.name}</p>
                </div>
              )}

              {document.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                </div>
              )}

              {document.author_details && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Author Details</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{document.author_details}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-1">File Type</h4>
                <p className="text-sm text-muted-foreground">TXT</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Upload Date</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>

              <Button className="w-full" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download TXT
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
