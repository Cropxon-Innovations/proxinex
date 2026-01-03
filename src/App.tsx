import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Compare from "./pages/Compare";
import Sandbox from "./pages/Sandbox";
import Docs from "./pages/Docs";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import AppDashboard from "./pages/AppDashboard";
import ResearchPage from "./pages/Research";
import NotebooksPage from "./pages/Notebooks";
import ApiKeysPage from "./pages/ApiKeys";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/app" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
              <Route path="/app/chat" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
              <Route path="/app/research" element={<ProtectedRoute><ResearchPage /></ProtectedRoute>} />
              <Route path="/app/notebooks" element={<ProtectedRoute><NotebooksPage /></ProtectedRoute>} />
              <Route path="/app/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
              <Route path="/app/*" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
