import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChatMessages, useSendMessage } from "@/hooks/useChat";
import { useDocuments } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, User, Send, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChatPanelProps {
  activeSessionId: number | null;
  onClearChat: () => void;
}

export function ChatPanel({ activeSessionId, onClearChat }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: documents } = useDocuments();
  const { data: messages, isLoading: messagesLoading } = useChatMessages(activeSessionId);
  const sendMessage = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processedDocuments = documents?.filter(doc => doc.processingStatus === "completed") || [];

  const handleSendMessage = async () => {
    if (!message.trim() || !activeSessionId) return;

    const messageToSend = message;
    setMessage("");

    sendMessage.mutate(
      { sessionId: activeSessionId, content: messageToSend },
      {
        onError: (error) => {
          setMessage(messageToSend); // Restore message on error
        },
      }
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <p className="text-sm text-gray-600">Ask questions about your documents</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearChat}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {processedDocuments.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Active Document
            </label>
            <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select a document..." />
              </SelectTrigger>
              <SelectContent>
                {processedDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>
                    {doc.originalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeSessionId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Chat</h3>
              <p className="text-gray-600">
                Select a document and start a chat to begin analyzing your content with AI.
              </p>
            </div>
          </div>
        ) : messagesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Welcome Message */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-gray-800">
                  Hello! I'm your AI assistant. I can help you analyze your documents, extract key insights, and answer specific questions about your content.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatTimestamp(new Date())}
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.role === "user" ? "justify-end" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`rounded-lg p-3 max-w-xs ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      msg.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {sendMessage.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">AI is thinking...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        {!activeSessionId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Start a chat with a document to begin asking questions.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask a question about your document..."
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessage.isPending}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Responses are generated using AI and may contain inaccuracies
              </p>
              <p className="text-xs text-gray-500">
                {message.length}/2000
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
