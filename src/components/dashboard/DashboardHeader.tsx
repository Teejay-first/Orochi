import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <header className="h-14 flex items-center px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="mr-4" />
      
      <div className="flex items-center gap-4 ml-auto">
        {/* Add any header actions here like user menu, notifications, etc. */}
      </div>
    </header>
  );
}