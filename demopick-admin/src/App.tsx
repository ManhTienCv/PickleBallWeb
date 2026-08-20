import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CourtMap from "./pages/CourtMap";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import CRM from "./pages/CRM";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Tự động chuyển hướng về Trang Tổng Quan (Dashboard) mỗi khi bấm F5 hoặc Reload lại trang
function ResetToHomeOnReload() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType?.("navigation") as PerformanceNavigationTiming[];
      const isReload =
        (navEntries && navEntries.length > 0 && navEntries[0]?.type === "reload") ||
        (performance as any)?.navigation?.type === 1;

      if (isReload && location.pathname !== "/" && location.pathname !== "/login") {
        navigate("/", { replace: true });
      }
    } catch {
      // Fallback ignore
    }
  }, []);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ResetToHomeOnReload />
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/court-map" element={<CourtMap />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
