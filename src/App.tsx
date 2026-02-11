import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { validateEnvironment } from "@/utils/env";
import { initializeGA } from "@/utils/analytics";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

import { Landing } from "./pages/Landing";
import { AgentsMeetupLayout } from "./pages/agents-meetup/layout/AgentsMeetupLayout";
import { NewChatView } from "./pages/agents-meetup/views/NewChatView";
import { ChatView } from "./pages/agents-meetup/views/ChatView";
import { SharedChatView } from "./pages/agents-meetup/views/SharedChatView";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-loaded views for better initial load performance
const ProfileView = lazy(() => import("./pages/agents-meetup/views/ProfileView").then(m => ({ default: m.ProfileView })));
const AgentProfilesView = lazy(() => import("./pages/agents-meetup/views/AgentProfilesView").then(m => ({ default: m.AgentProfilesView })));
const LearnView = lazy(() => import("./pages/agents-meetup/views/LearnView").then(m => ({ default: m.LearnView })));
const ModelsView = lazy(() => import("./pages/agents-meetup/views/ModelsView").then(m => ({ default: m.ModelsView })));
const StatusView = lazy(() => import("./pages/agents-meetup/views/StatusView").then(m => ({ default: m.StatusView })));
const AboutView = lazy(() => import("./pages/agents-meetup/views/AboutView").then(m => ({ default: m.AboutView })));
const SettingsView = lazy(() => import("./pages/agents-meetup/views/SettingsView").then(m => ({ default: m.SettingsView })));
const AdminView = lazy(() => import("./pages/agents-meetup/views/AdminView").then(m => ({ default: m.AdminView })));
const ExploreView = lazy(() => import("./pages/agents-meetup/views/ExploreView"));
const LeaderboardView = lazy(() => import("./pages/agents-meetup/views/LeaderboardView"));
const PaymentSuccessView = lazy(() => import("./pages/agents-meetup/views/PaymentSuccessView").then(m => ({ default: m.PaymentSuccessView })));

// Google Analytics page view tracking + dynamic GA ID from feature flags
const PageTracker = () => {
  const location = useLocation();
  const { getTextValue, loading: flagsLoading } = useFeatureFlags();
  
  // Initialize GA with admin-configured tracking ID
  useEffect(() => {
    if (flagsLoading) return;
    const gaId = getTextValue('google_analytics_id');
    if (gaId) {
      initializeGA(gaId);
    }
  }, [flagsLoading, getTextValue]);
  
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

// Validate environment variables on app startup
validateEnvironment();

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
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
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
                  <Route path="payment-success" element={<ErrorBoundary><PaymentSuccessView /></ErrorBoundary>} />
                </Route>
                <Route path="/shared/:shareId" element={<ErrorBoundary><SharedChatView /></ErrorBoundary>} />
                <Route path="/auth" element={<Auth />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
