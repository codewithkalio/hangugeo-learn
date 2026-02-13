import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import FlashcardBank from "./pages/FlashcardBank";
import FlashcardForm from "./pages/FlashcardForm";
import FlashcardDrill from "./pages/FlashcardDrill";
import Stats from "./pages/Stats";
import AIQuiz from "./pages/AIQuiz";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/cards" element={<ProtectedRoute><AppLayout><FlashcardBank /></AppLayout></ProtectedRoute>} />
              <Route path="/cards/new" element={<ProtectedRoute><AppLayout><FlashcardForm /></AppLayout></ProtectedRoute>} />
              <Route path="/cards/edit/:id" element={<ProtectedRoute><AppLayout><FlashcardForm /></AppLayout></ProtectedRoute>} />
              <Route path="/drill" element={<ProtectedRoute><AppLayout><FlashcardDrill /></AppLayout></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><AppLayout><Stats /></AppLayout></ProtectedRoute>} />
              <Route path="/ai-quiz" element={<ProtectedRoute><AppLayout><AIQuiz /></AppLayout></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
