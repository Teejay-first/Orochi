import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AgentProvider } from "@/contexts/AgentContext";
import { RequireAdmin } from "@/components/RequireAdmin";
import { Home } from "./pages/Home";
import { AgentSession } from "./pages/AgentSession";
import { Conversations } from "./pages/Conversations";
import { Admin } from "./pages/Admin";
import { Auth } from "./pages/Auth";
import { CreateAgent } from "./pages/CreateAgent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AgentProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/agent/:id" element={<AgentSession />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/create-agent" element={<CreateAgent />} />
            <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AgentProvider>
  </QueryClientProvider>
);

export default App;
