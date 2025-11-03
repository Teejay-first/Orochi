import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DashboardView } from "@/pages/Dashboard";

interface DashboardHeaderProps {
  currentView: DashboardView;
}

const getViewTitle = (view: DashboardView): string => {
  const titles: Record<DashboardView, string> = {
    "agents": "Assistants",
    "workflows": "Workflows",
    "sub-agents": "Sub Agents",
    "connectors": "Connectors",
    "self-improvement": "Self Improvement",
    "knowledge-base": "Knowledge Base",
    "tools": "Tools",
    "use-cases": "Use Cases",
    "phone-numbers": "Phone Numbers",
    "website-widget": "Website Widget",
    "whatsapp": "WhatsApp",
    "mobile-app": "Mobile App",
    "api": "API",
    "webhooks": "Webhooks",
    "usage-cost": "Usage & Cost",
    "call-history": "Call History",
    "analytics": "Analytics",
    "settings": "Settings",
    "agent-config": "Agent Configuration",
  };
  return titles[view] || "Dashboard";
};

const getViewCategory = (view: DashboardView): string | null => {
  if (["agents", "workflows", "knowledge-base", "tools"].includes(view)) {
    return "Build";
  }
  if (["phone-numbers", "website-widget", "whatsapp", "mobile-app", "api", "webhooks"].includes(view)) {
    return "Deploy";
  }
  if (["analytics", "call-history", "usage-cost"].includes(view)) {
    return "Monitor";
  }
  if (view === "settings") {
    return "Settings";
  }
  return null;
};

export function DashboardHeader({ currentView }: DashboardHeaderProps) {
  const category = getViewCategory(currentView);
  const title = getViewTitle(currentView);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="text-muted-foreground">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            {category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="text-muted-foreground">
                    {category}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}