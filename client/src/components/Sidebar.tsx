import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Brain, FileText, MessageSquare, Settings, LogOut, User } from "lucide-react";

interface SidebarProps {
  activeTab: "documents" | "chat" | "settings";
  onTabChange: (tab: "documents" | "chat" | "settings") => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logOut } = useAuth();
  const { toast } = useToast();

  const handleLogOut = async () => {
    try {
      await logOut();
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Strategic Insight</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Button
            variant={activeTab === "documents" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("documents")}
          >
            <FileText className="w-4 h-4 mr-3" />
            Documents
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("chat")}
          >
            <MessageSquare className="w-4 h-4 mr-3" />
            Chat History
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("settings")}
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.displayName || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
