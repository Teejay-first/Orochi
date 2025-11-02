import { useState } from "react";
import { Bot, BookOpen, Phone, History, BarChart3, User, Network, Plug, TrendingUp, ChevronRight, Wrench, Webhook, DollarSign, Settings as SettingsIcon, Workflow } from "lucide-react";
import { DashboardView } from "@/pages/Dashboard";
import { useProvider } from "@/contexts/ProviderContext";
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
  { title: "Assistants", view: "agents" as const, icon: Bot },
  { title: "Workflows", view: "workflows" as const, icon: Workflow },
  { title: "Knowledge Base", view: "knowledge-base" as const, icon: BookOpen },
  { title: "Tools", view: "tools" as const, icon: Wrench },
];

const deployItems = [
  { title: "Phone Numbers", view: "phone-numbers" as const, icon: Phone },
  { title: "Webhooks", view: "webhooks" as const, icon: Webhook },
];

const monitorItems = [
  { title: "Analytics", view: "analytics" as const, icon: BarChart3 },
];

const settingsItems = [
  { title: "Providers", view: "settings" as const, icon: SettingsIcon },
];

export function DashboardSidebar({ currentView, onViewChange }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const { activeConnection } = useProvider();

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
          {state === "expanded" && (
            <div className="mt-2 text-sm text-muted-foreground">
              demo@voxhive.ai
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

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              SETTINGS
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
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

        {/* Footer - Provider & Usage Card */}
        {state === "expanded" && (
          <SidebarFooter className="p-4 space-y-3">
            {activeConnection && (
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">
                    {activeConnection.provider === 'vapi' ? '🟣 Vapi' : activeConnection.provider}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeConnection.label || 'Connected'}
                </div>
              </Card>
            )}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-medium">Pay As You Go</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Month:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calls:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </Card>
          </SidebarFooter>
        )}
      </SidebarContent>
    </Sidebar>
  );
}