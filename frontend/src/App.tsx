import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import externalAuthService from "@/services/externalAuthService";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import Address from "./pages/Address";
import Admin from "./pages/Admin";
import AngelThon from "./pages/AngelThon";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import ThankYou from "./pages/ThankYou";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { initialize } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize auth system
      initialize();

      // Initialize external auth on app startup
      try {
        // Check for userId in URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const userIdFromUrl = urlParams.get('userId') || urlParams.get('user');

        if (userIdFromUrl) {
          console.log('Found userId in URL:', userIdFromUrl);
          // Fetch fresh data for this user
          await externalAuthService.fetchUserData(userIdFromUrl);
        } else {
          // Initialize with existing localStorage data
          const externalUserData = await externalAuthService.initialize();
          if (externalUserData) {
            console.log('External user authenticated:', externalUserData);
          }
        }
      } catch (error) {
        console.error('Failed to initialize external auth:', error);
      }
    };

    initializeApp();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/address" element={<Address />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/angelthon" element={<AngelThon />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/thankyou" element={<ThankYou />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
