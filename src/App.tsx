import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import LoginHOD from "./pages/LoginHOD";
import LoginStaff from "./pages/LoginStaff";
import HodDashboard from "./pages/HodDashboard";
import AddStudent from "./pages/AddStudent";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login_hod" element={<LoginHOD />} />
          <Route path="/login_staff" element={<LoginStaff />} />
          <Route path="/forget" element={<ForgotPassword />} />
          <Route 
            path="/hod_dashboard" 
            element={
              <ProtectedRoute>
                <HodDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hod_dashboard/addStudent" 
            element={
              <ProtectedRoute>
                <AddStudent />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
