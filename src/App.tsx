import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import FlashcardBank from "./pages/FlashcardBank";
import FlashcardForm from "./pages/FlashcardForm";
import FlashcardDrill from "./pages/FlashcardDrill";
import Stats from "./pages/Stats";
import AIQuiz from "./pages/AIQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cards" element={<FlashcardBank />} />
              <Route path="/cards/new" element={<FlashcardForm />} />
              <Route path="/cards/edit/:id" element={<FlashcardForm />} />
              <Route path="/drill" element={<FlashcardDrill />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/ai-quiz" element={<AIQuiz />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
