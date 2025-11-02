import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AgentProvider } from "@/contexts/AgentContext";
import { ProviderProvider } from "@/contexts/ProviderContext";
import { Dashboard } from "./pages/Dashboard";
import { Start } from "./pages/Start";
import { Landing } from "./pages/Landing";
import { Diagnostic } from "./pages/Diagnostic";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProviderProvider>
      <AgentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/start" element={<Start />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/diagnostic" element={<Diagnostic />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AgentProvider>
    </ProviderProvider>
  </QueryClientProvider>
);

export default App;
