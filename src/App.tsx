import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Landing } from "./pages/Landing";
import { AgentsMeetupLayout } from "./pages/agents-meetup/layout/AgentsMeetupLayout";
import { NewChatView } from "./pages/agents-meetup/views/NewChatView";
import { ChatView } from "./pages/agents-meetup/views/ChatView";
import { SharedChatView } from "./pages/agents-meetup/views/SharedChatView";
import { ProfileView } from "./pages/agents-meetup/views/ProfileView";
import { AgentProfilesView } from "./pages/agents-meetup/views/AgentProfilesView";
import { LearnView } from "./pages/agents-meetup/views/LearnView";
import { ModelsView } from "./pages/agents-meetup/views/ModelsView";
import { StatusView } from "./pages/agents-meetup/views/StatusView";
import { AboutView } from "./pages/agents-meetup/views/AboutView";
import { SettingsView } from "./pages/agents-meetup/views/SettingsView";
import { AdminView } from "./pages/agents-meetup/views/AdminView";
import ExploreView from "./pages/agents-meetup/views/ExploreView";
import LeaderboardView from "./pages/agents-meetup/views/LeaderboardView";
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageTracker />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<AgentsMeetupLayout />}>
                <Route path="new" element={<ErrorBoundary><NewChatView /></ErrorBoundary>} />
                <Route path="chat/:chatId" element={<ErrorBoundary><ChatView /></ErrorBoundary>} />
                <Route path="explore" element={<ErrorBoundary><ExploreView /></ErrorBoundary>} />
                <Route path="leaderboard" element={<ErrorBoundary><LeaderboardView /></ErrorBoundary>} />
                <Route path="profile" element={<ErrorBoundary><ProfileView /></ErrorBoundary>} />
                <Route path="agent-profiles" element={<ErrorBoundary><AgentProfilesView /></ErrorBoundary>} />
                <Route path="learn" element={<ErrorBoundary><LearnView /></ErrorBoundary>} />
                <Route path="models" element={<ErrorBoundary><ModelsView /></ErrorBoundary>} />
                <Route path="status" element={<ErrorBoundary><StatusView /></ErrorBoundary>} />
                <Route path="about" element={<ErrorBoundary><AboutView /></ErrorBoundary>} />
                <Route path="settings" element={<ErrorBoundary><SettingsView /></ErrorBoundary>} />
                <Route path="admin" element={<ErrorBoundary><AdminView /></ErrorBoundary>} />
              </Route>
              <Route path="/shared/:shareId" element={<ErrorBoundary><SharedChatView /></ErrorBoundary>} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
