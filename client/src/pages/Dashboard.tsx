import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentList } from "@/components/DocumentList";
import { ChatPanel } from "@/components/ChatPanel";
import { FileUploadModal } from "@/components/FileUploadModal";
import { Plus } from "lucide-react";

type TabType = "documents" | "chat" | "settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("documents");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeChatSessionId, setActiveChatSessionId] = useState<number | null>(null);

  const handleStartChat = (sessionId: number) => {
    setActiveChatSessionId(sessionId);
    setActiveTab("documents"); // Stay on documents tab to see both documents and chat
  };

  const handleClearChat = () => {
    setActiveChatSessionId(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {activeTab === "documents" ? "Document Analysis" : 
                 activeTab === "chat" ? "Chat History" : "Settings"}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === "documents" ? "Upload and analyze your documents with AI" :
                 activeTab === "chat" ? "View your previous conversations" : "Manage your account settings"}
              </p>
            </div>
            {activeTab === "documents" && (
              <Button onClick={() => setUploadModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {activeTab === "documents" && (
            <>
              <div className="flex-1 p-6">
                <div className="mb-6">
                  <DocumentUpload />
                </div>
                <DocumentList onStartChat={handleStartChat} />
              </div>
              <ChatPanel 
                activeSessionId={activeChatSessionId} 
                onClearChat={handleClearChat}
              />
            </>
          )}

          {activeTab === "chat" && (
            <div className="flex-1 p-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chat History</h3>
                <p className="text-gray-600">
                  Your chat history will appear here. Start by analyzing a document to begin chatting with AI.
                </p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex-1 p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-600">
                    Settings panel coming soon. This will include preferences for AI model selection, 
                    document processing options, and account management features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FileUploadModal 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen} 
      />
    </div>
  );
}
