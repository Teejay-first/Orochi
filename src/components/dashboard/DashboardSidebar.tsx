import { Bot, BookOpen, Phone, PhoneCall, History, BarChart3, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardView } from "@/pages/Dashboard";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DashboardSidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const buildItems = [
  { title: "Agents", view: "agents" as const, icon: Bot },
  { title: "Knowledge Base", view: "knowledge-base" as const, icon: BookOpen },
];

const deployItems = [
  { title: "Phone Numbers", view: "phone-numbers" as const, icon: Phone },
];

const monitorItems = [
  { title: "Call History", view: "call-history" as const, icon: History },
  { title: "Analytics", view: "analytics" as const, icon: BarChart3 },
];

export function DashboardSidebar({ currentView, onViewChange }: DashboardSidebarProps) {
  const { user } = useAuth();
  const { state } = useSidebar();

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            {state === "expanded" && (
              <>
                <div className="font-semibold text-foreground">VoxHive</div>
                <div className="ml-auto">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              </>
            )}
          </div>
          {state === "expanded" && user && (
            <div className="mt-2 text-sm text-muted-foreground">
              {user.email}
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              BUILD
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {buildItems.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton 
                      onClick={() => onViewChange(item.view)}
                      isActive={currentView === item.view}
                      className="w-full justify-start"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              DEPLOY
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {deployItems.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton 
                      onClick={() => onViewChange(item.view)}
                      isActive={currentView === item.view}
                      className="w-full justify-start"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              MONITOR
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {monitorItems.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton 
                      onClick={() => onViewChange(item.view)}
                      isActive={currentView === item.view}
                      className="w-full justify-start"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer - Usage Card */}
        {state === "expanded" && (
          <SidebarFooter className="p-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium">Pay As You Go</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concurrency Used:</span>
                  <span className="font-medium">0/20</span>
                </div>
              </div>
            </Card>
          </SidebarFooter>
        )}
      </SidebarContent>
    </Sidebar>
  );
}