// Landing Page - Redirect to /start or /dashboard based on provider status
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProvider } from "@/contexts/ProviderContext";
import { Loader2 } from "lucide-react";

export function Landing() {
  const navigate = useNavigate();
  const { connections, loading } = useProvider();

  useEffect(() => {
    if (!loading) {
      if (connections.length === 0) {
        // No providers connected, go to onboarding
        navigate("/start", { replace: true });
      } else {
        // Has providers, go to dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [connections, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Loading VoxHive...</p>
      </div>
    </div>
  );
}
