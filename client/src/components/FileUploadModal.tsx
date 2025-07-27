import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadDocument } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, X, FileText, File } from "lucide-react";

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export function FileUploadModal({ open, onOpenChange }: FileUploadModalProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadDocument = useUploadDocument();
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => 
      file.type === 'application/pdf' || file.type === 'text/plain'
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only PDF and TXT files are allowed.",
        variant: "destructive",
      });
    }

    validFiles.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        });
        return;
      }

      const uploadingFile: UploadingFile = {
        file,
        progress: 0,
        status: 'uploading',
      };

      setUploadingFiles(prev => [...prev, uploadingFile]);

      // Simulate progress for better UX
      const interval = setInterval(() => {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === file && f.status === 'uploading' 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      uploadDocument.mutate(file, {
        onSuccess: () => {
          clearInterval(interval);
          setUploadingFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, progress: 100, status: 'completed' }
                : f
            )
          );
          toast({
            title: "Upload successful",
            description: `${file.name} has been uploaded and is being processed.`,
          });
        },
        onError: (error) => {
          clearInterval(interval);
          setUploadingFiles(prev => 
            prev.map(f => 
              f.file === file 
                ? { ...f, status: 'error' }
                : f
            )
          );
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const clearCompletedUploads = () => {
    setUploadingFiles(prev => prev.filter(f => f.status === 'uploading'));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleClose = () => {
    if (uploadingFiles.some(f => f.status === 'uploading')) {
      if (confirm("There are files still uploading. Are you sure you want to close?")) {
        setUploadingFiles([]);
        onOpenChange(false);
      }
    } else {
      setUploadingFiles([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Upload Documents</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-blue-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <CloudUpload className="w-full h-full" />
          </div>
          <p className="text-gray-600 mb-4">
            {isDragOver 
              ? "Drop your files here..." 
              : "Drag and drop files here or click to browse"
            }
          </p>
          <Button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.txt';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                handleFileSelect(target.files);
              };
              input.click();
            }}
          >
            Select Files
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            PDF and TXT files only, max 10MB each
          </p>
        </div>

        {uploadingFiles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Upload Progress</h4>
              {uploadingFiles.some(f => f.status === 'completed') && (
                <Button variant="ghost" size="sm" onClick={clearCompletedUploads}>
                  Clear Completed
                </Button>
              )}
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {uploadingFiles.map((uploadingFile, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {uploadingFile.file.type === 'application/pdf' ? (
                        <File className="w-4 h-4 text-red-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {uploadingFile.file.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatFileSize(uploadingFile.file.size)}
                    </span>
                  </div>
                  
                  {uploadingFile.status === 'uploading' && (
                    <>
                      <Progress value={uploadingFile.progress} className="mb-1" />
                      <p className="text-xs text-gray-500">
                        Uploading... {uploadingFile.progress}%
                      </p>
                    </>
                  )}
                  
                  {uploadingFile.status === 'completed' && (
                    <p className="text-xs text-green-600">Upload completed</p>
                  )}
                  
                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-red-600">Upload failed</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleClose}>
            {uploadingFiles.some(f => f.status === 'uploading') ? 'Cancel' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
