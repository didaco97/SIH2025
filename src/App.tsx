import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerClaimsMonitoring from "./pages/officer/OfficerClaimsMonitoring";
import OfficerAnalytics from "./pages/officer/OfficerAnalytics";
import OfficerSettings from "./pages/officer/OfficerSettings";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/officer/claims" element={<OfficerClaimsMonitoring />} />
          <Route path="/officer/analytics" element={<OfficerAnalytics />} />
          <Route path="/officer/settings" element={<OfficerSettings />} />
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/farmer/*" element={<FarmerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
