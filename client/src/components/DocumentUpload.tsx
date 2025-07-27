import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUploadDocument } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, FileText, File } from "lucide-react";

export function DocumentUpload() {
  const uploadDocument = useUploadDocument();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadDocument.mutate(file, {
        onSuccess: () => {
          toast({
            title: "Upload successful",
            description: `${file.name} has been uploaded and is being processed.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    });
  }, [uploadDocument, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  return (
    <Card className={`border-2 border-dashed transition-colors ${
      isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
    }`}>
      <CardContent className="p-8">
        <div {...getRootProps()} className="text-center cursor-pointer">
          <input {...getInputProps()} />
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <CloudUpload className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
          <p className="text-gray-600 mb-4">
            {isDragActive
              ? "Drop your files here..."
              : "Drag and drop your PDF or TXT files here, or click to browse"}
          </p>
          <Button 
            type="button" 
            disabled={uploadDocument.isPending}
            className="mb-2"
          >
            {uploadDocument.isPending ? "Uploading..." : "Choose Files"}
          </Button>
          <p className="text-xs text-gray-500">
            Supports PDF and TXT files up to 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
