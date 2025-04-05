
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Labs from "./pages/Labs";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/ChatWidget";

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

// Updated webhook URL with the actual production URL
const CHAT_WEBHOOK_URL = "https://agent.froste.eu/webhook/3092ebad-b671-44ad-8b3d-b4d12b7ea76b/chat";

// Updated greeting message with the new text
const CHAT_GREETING = "What's on your mind, can I help?";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTracker />
          <ChatWidget 
            webhookUrl={CHAT_WEBHOOK_URL} 
            greeting={CHAT_GREETING}
          />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/labs" element={<Labs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
