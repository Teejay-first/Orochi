import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <header className="h-14 flex items-center px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="mr-4" />
      
      <div className="flex items-center gap-4 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="hover:bg-primary/10 hover:border-primary-glow hover:text-primary-glow transition-smooth"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </div>
    </header>
  );
}