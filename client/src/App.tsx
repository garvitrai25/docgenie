import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

function AppContent() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    console.log("✅ Auth loading:", loading);
    console.log("👤 Current user:", user);
    if (!loading && !user) {
      setAuthModalOpen(true);
    } else if (user) {
      setAuthModalOpen(false);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        {/* Loading content */}
        <div className="relative z-10 text-center backdrop-blur-sm bg-white/5 p-12 rounded-3xl border border-white/10 shadow-2xl">
          <div className="relative mb-8">
            {/* Outer rotating ring */}
            <div className="w-16 h-16 border-4 border-transparent border-t-purple-400 border-r-purple-400 rounded-full animate-spin mx-auto"></div>
            {/* Inner rotating ring */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 border-4 border-transparent border-b-blue-400 border-l-blue-400 rounded-full animate-spin animate-reverse"></div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              Loading
            </h3>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`
           }}>
      </div>
      
      <div className="relative z-10">
        <Switch>
          {user && <Route path="/" component={Dashboard} />}
          {!user && (
            <Route 
              path="/" 
              component={() => (
                <div className="min-h-screen flex items-center justify-center px-4">
                  <div className="text-center max-w-md mx-auto">
                    <div className="mb-8 relative">
                      {/* Decorative elements */}
                      <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-slate-300 rounded-tl-lg"></div>
                      <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-slate-300 rounded-tr-lg"></div>
                      <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-slate-300 rounded-bl-lg"></div>
                      <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-slate-300 rounded-br-lg"></div>
                      
                      <div className="bg-white p-12 rounded-2xl shadow-xl border border-slate-200/50 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <div className="w-8 h-8 border-2 border-white rounded-lg"></div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">
                          Welcome Back
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                          Please sign in to access your dashboard and continue your journey.
                        </p>
                        
                        <div className="mt-8 pt-6 border-t border-slate-200">
                          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span>Secure authentication</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )} 
            />
          )}
          <Route component={NotFound} />
        </Switch>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="relative">
            <Toaster />
            <AppContent />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;