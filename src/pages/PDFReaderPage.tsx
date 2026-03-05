import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDocument, getSignedUrl, getReadingProgress, saveReadingProgress, searchDocuments, createSystemLog } from '@/db/api';
import type { BookDocument } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Search,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState<BookDocument | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    loadDocument();
  }, [id]);

  useEffect(() => {
    if (profile?.id && id && currentPage > 1) {
      const timer = setTimeout(() => {
        saveReadingProgress(profile.id, id, currentPage);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, profile, id]);

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

      if (doc.file_type !== 'pdf') {
        toast.error('This is not a PDF document');
        navigate(`/text-reader/${id}`);
        return;
      }

      setDocument(doc);

      const signedUrl = await getSignedUrl(doc.file_path);
      if (signedUrl) {
        setPdfUrl(signedUrl);
      }

      if (profile?.id && id) {
        const progress = await getReadingProgress(profile.id, id);
        if (progress) {
          setCurrentPage(progress.last_page);
          setPageInput(progress.last_page.toString());
        }
      }
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
    }
  };

  const handlePageJump = () => {
    const page = Number.parseInt(pageInput);
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleFullscreen = () => {
    const elem = window.document.getElementById('pdf-viewer');
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    try {
      const signedUrl = await getSignedUrl(document.file_path);
      if (signedUrl) {
        const link = window.document.createElement('a');
        link.href = signedUrl;
        link.download = `${document.title}.pdf`;
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

  if (!document || !pdfUrl) {
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
        {/* Main PDF Viewer */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handlePrevPage} disabled={currentPage <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onBlur={handlePageJump}
                      onKeyDown={(e) => e.key === 'Enter' && handlePageJump()}
                      className="w-16 text-center"
                      min={1}
                      max={numPages}
                    />
                    <span className="text-sm text-muted-foreground">/ {numPages}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleNextPage} disabled={currentPage >= numPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">{Math.round(scale * 100)}%</span>
                  <Button size="sm" variant="outline" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <Button size="sm" variant="outline" onClick={handleFullscreen}>
                  <Maximize className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>

                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <div className="flex gap-2 mt-4">
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
            </CardContent>
          </Card>

          {/* PDF Display */}
          <Card id="pdf-viewer">
            <CardContent className="p-4">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="flex justify-center">
                  <PDFDocument
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<Skeleton className="h-96 w-full bg-muted" />}
                  >
                    <PDFPage
                      pageNumber={currentPage}
                      scale={scale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </PDFDocument>
                </div>
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
                <h4 className="text-sm font-medium mb-1">Pages</h4>
                <p className="text-sm text-muted-foreground">{numPages}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Upload Date</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>

              <Button className="w-full" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
