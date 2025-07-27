import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments, useDeleteDocument } from "@/hooks/useDocuments";
import { useCreateChatSession } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, File, MessageSquare, MoreVertical, Trash2, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Document } from "@shared/schema";

interface DocumentListProps {
  onStartChat: (sessionId: number) => void;
}

export function DocumentList({ onStartChat }: DocumentListProps) {
  const [filter, setFilter] = useState<string>("all");
  const { data: documents, isLoading } = useDocuments();
  const deleteDocument = useDeleteDocument();
  const createChatSession = useCreateChatSession();
  const { toast } = useToast();

  const handleStartChat = (document: Document) => {
    if (document.processingStatus !== "completed") {
      toast({
        title: "Document not ready",
        description: "Please wait for the document to finish processing.",
        variant: "destructive",
      });
      return;
    }

    createChatSession.mutate(document.id, {
      onSuccess: (session) => {
        onStartChat(session.id);
        toast({
          title: "Chat started",
          description: `Started chat with ${document.originalName}`,
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to start chat",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleDeleteDocument = (document: Document) => {
    if (confirm(`Are you sure you want to delete "${document.originalName}"?`)) {
      deleteDocument.mutate(document.id, {
        onSuccess: () => {
          toast({
            title: "Document deleted",
            description: `${document.originalName} has been deleted.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Delete failed",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  const filteredDocuments = documents?.filter((doc) => {
    if (filter === "all") return true;
    if (filter === "pdf") return doc.fileType === "application/pdf";
    if (filter === "txt") return doc.fileType === "text/plain";
    return true;
  }) || [];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Uploaded today";
    if (diffDays === 2) return "Uploaded yesterday";
    if (diffDays <= 7) return `Uploaded ${diffDays - 1} days ago`;
    return `Uploaded on ${new Date(date).toLocaleDateString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Documents</h3>
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="pdf">PDF Only</SelectItem>
              <SelectItem value="txt">TXT Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <FileText className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {filter === "all" 
                ? "Upload your first document to get started with AI analysis."
                : `No ${filter.toUpperCase()} files found. Try changing the filter.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      document.fileType === "application/pdf" 
                        ? "bg-red-100" 
                        : "bg-blue-100"
                    }`}>
                      {document.fileType === "application/pdf" ? (
                        <File className={`w-5 h-5 ${
                          document.fileType === "application/pdf" 
                            ? "text-red-600" 
                            : "text-blue-600"
                        }`} />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{document.originalName}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {document.extractedText 
                          ? `${document.extractedText.slice(0, 100)}...`
                          : "Document analysis in progress..."
                        }
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{formatDate(document.uploadedAt)}</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        {document.extractedText && (
                          <span>{Math.ceil(document.extractedText.split(' ').length / 100)} chunks</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(document.processingStatus)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartChat(document)}
                      disabled={document.processingStatus !== "completed" || createChatSession.isPending}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDocument(document)}
                          className="text-red-600"
                          disabled={deleteDocument.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
