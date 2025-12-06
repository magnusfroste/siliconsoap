
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { Landing } from "./pages/Landing";
import { AgentsMeetupLayout } from "./pages/agents-meetup/layout/AgentsMeetupLayout";
import { NewChatView } from "./pages/agents-meetup/views/NewChatView";
import { ChatView } from "./pages/agents-meetup/views/ChatView";
import { SharedChatView } from "./pages/agents-meetup/views/SharedChatView";
import { ProfileView } from "./pages/agents-meetup/views/ProfileView";
import { AgentProfilesView } from "./pages/agents-meetup/views/AgentProfilesView";
import { LearnView } from "./pages/agents-meetup/views/LearnView";
import { ModelsView } from "./pages/agents-meetup/views/ModelsView";
import { SettingsView } from "./pages/agents-meetup/views/SettingsView";
import { AdminView } from "./pages/agents-meetup/views/AdminView";
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
            <Route path="/" element={<Landing />} />
            <Route element={<AgentsMeetupLayout />}>
              <Route path="new" element={<NewChatView />} />
              <Route path="chat/:chatId" element={<ChatView />} />
              <Route path="profile" element={<ProfileView />} />
              <Route path="agent-profiles" element={<AgentProfilesView />} />
              <Route path="learn" element={<LearnView />} />
              <Route path="models" element={<ModelsView />} />
              <Route path="settings" element={<SettingsView />} />
              <Route path="admin" element={<AdminView />} />
            </Route>
            <Route path="/shared/:shareId" element={<SharedChatView />} />
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
