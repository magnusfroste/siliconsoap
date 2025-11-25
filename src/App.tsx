
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Labs from "./pages/Labs";
import { AgentsMeetupLayout } from "./pages/labs/projects/agents-meetup/layout/AgentsMeetupLayout";
import { NewChatView } from "./pages/labs/projects/agents-meetup/views/NewChatView";
import { ChatView } from "./pages/labs/projects/agents-meetup/views/ChatView";
import { ProfileView } from "./pages/labs/projects/agents-meetup/views/ProfileView";
import { AgentProfilesView } from "./pages/labs/projects/agents-meetup/views/AgentProfilesView";
import { APISettingsView } from "./pages/labs/projects/agents-meetup/views/APISettingsView";
import { SettingsView } from "./pages/labs/projects/agents-meetup/views/SettingsView";
import WorkflowBuilder from "./pages/labs/projects/workflow-builder";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Google Analytics page view tracking component
const PageTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);
  
  return null;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTracker />
          <Routes>
            <Route path="/" element={<Navigate to="/labs" replace />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/labs/agents-meetup" element={<AgentsMeetupLayout />}>
              <Route index element={<NewChatView />} />
              <Route path="chat/:chatId" element={<ChatView />} />
              <Route path="profile" element={<ProfileView />} />
              <Route path="agent-profiles" element={<AgentProfilesView />} />
              <Route path="api-settings" element={<APISettingsView />} />
              <Route path="settings" element={<SettingsView />} />
            </Route>
            <Route path="/labs/workflow-builder" element={<WorkflowBuilder />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
