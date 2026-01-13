import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageTransitionProvider } from "@/contexts/PageTransitionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommandPalette } from "@/components/CommandPalette";
import { NotificationProvider } from "@/components/NotificationCenter";
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
import InlineAsksPage from "./pages/InlineAsks";
import DocumentsPage from "./pages/Documents";
import UsagePage from "./pages/Usage";
import SettingsPage from "./pages/Settings";
import VideoPage from "./pages/Video";
import ImagesPage from "./pages/Images";
import ProjectMemoryPage from "./pages/ProjectMemory";
import PersonalizationPage from "./pages/Personalization";
import HelpCenterPage from "./pages/HelpCenter";
import ProjectsPage from "./pages/Projects";
import PinnedContentPage from "./pages/PinnedContent";
import NotFound from "./pages/NotFound";
import Memorix from "./pages/Memorix";
import MemorixWorkspace from "./pages/MemorixWorkspace";
import ProductOverview from "./pages/ProductOverview";
import ProductInlineAsk from "./pages/ProductInlineAsk";
import ProductHowItWorks from "./pages/ProductHowItWorks";
import ProductTrust from "./pages/ProductTrust";
import ProductDevelopers from "./pages/ProductDevelopers";
import ProductEnterprise from "./pages/ProductEnterprise";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import DataPolicy from "./pages/DataPolicy";
import GDPRPolicy from "./pages/GDPRPolicy";
import Security from "./pages/Security";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PageTransitionProvider>
                <CommandPalette />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/sandbox" element={<Sandbox />} />
                  <Route path="/memorix" element={<Memorix />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  {/* Product Pages */}
                  <Route path="/product" element={<ProductOverview />} />
                  <Route path="/product/how-it-works" element={<ProductHowItWorks />} />
                  <Route path="/product/inline-ask" element={<ProductInlineAsk />} />
                  <Route path="/product/trust" element={<ProductTrust />} />
                  <Route path="/product/developers" element={<ProductDevelopers />} />
                  <Route path="/product/enterprise" element={<ProductEnterprise />} />
                  {/* Company Pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/contact" element={<Contact />} />
                  {/* Legal Pages */}
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/refund" element={<RefundPolicy />} />
                  <Route path="/data-policy" element={<DataPolicy />} />
                  <Route path="/gdpr" element={<GDPRPolicy />} />
                  <Route path="/security" element={<Security />} />
                  {/* Checkout */}
                  <Route path="/checkout" element={<Checkout />} />
                  {/* App Routes */}
                  <Route path="/app" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
                  <Route path="/app/chat" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
                  <Route path="/app/research" element={<ProtectedRoute><ResearchPage /></ProtectedRoute>} />
                  <Route path="/app/memory" element={<ProtectedRoute><ProjectMemoryPage /></ProtectedRoute>} />
                  <Route path="/app/notebooks" element={<ProtectedRoute><NotebooksPage /></ProtectedRoute>} />
                  <Route path="/app/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
                  <Route path="/app/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
                  <Route path="/app/images" element={<ProtectedRoute><ImagesPage /></ProtectedRoute>} />
                  <Route path="/app/video" element={<ProtectedRoute><VideoPage /></ProtectedRoute>} />
                  <Route path="/app/usage" element={<ProtectedRoute><UsagePage /></ProtectedRoute>} />
                  <Route path="/app/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/app/personalization" element={<ProtectedRoute><PersonalizationPage /></ProtectedRoute>} />
                  <Route path="/app/help" element={<ProtectedRoute><HelpCenterPage /></ProtectedRoute>} />
                  <Route path="/app/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                  <Route path="/app/pinned" element={<ProtectedRoute><PinnedContentPage /></ProtectedRoute>} />
                  <Route path="/app/inline-asks" element={<ProtectedRoute><InlineAsksPage /></ProtectedRoute>} />
                  <Route path="/app/memorix" element={<ProtectedRoute><MemorixWorkspace /></ProtectedRoute>} />
                  <Route path="/app/*" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransitionProvider>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
