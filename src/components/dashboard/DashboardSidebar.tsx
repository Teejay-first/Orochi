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

const getProviderName = (provider: string): string => {
  switch (provider) {
    case 'vapi':
      return 'Vapi';
    case 'elevenlabs':
      return 'ElevenLabs';
    case 'orochi':
      return 'Orochi Pipeline';
    default:
      return provider;
  }
};

export function DashboardSidebar({ currentView, onViewChange }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const { activeConnection } = useProvider();

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            {state === "expanded" && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">VoxHive</div>
                <div className="text-xs text-muted-foreground truncate">demo@voxhive.ai</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarGroup className="mb-6">
            <SidebarGroupLabel className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              BUILD
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {buildItems.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.view)}
                      isActive={currentView === item.view}
                      className="w-full justify-start gap-3 px-4"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mb-6">
            <SidebarGroupLabel className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              DEPLOY
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {deployItems.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.view)}
                      isActive={currentView === item.view}
                      className="w-full justify-start gap-3 px-4"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mb-6">
            <SidebarGroupLabel className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              MONITOR
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {monitorItems.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.view)}
                      isActive={currentView === item.view}
                      className="w-full justify-start gap-3 px-4"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              SETTINGS
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.view}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.view)}
                      isActive={currentView === item.view}
                      className="w-full justify-start gap-3 px-4"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer - Provider & Usage Card */}
        {state === "expanded" && (
          <SidebarFooter className="px-4 py-3 border-t border-border space-y-2">
            {activeConnection && (
              <Card className="p-3 bg-card border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 bg-success rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {getProviderName(activeConnection.provider)}
                    </div>
                    {activeConnection.label && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {activeConnection.label}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
            <Card className="p-3 bg-card border-border">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                <span className="text-sm font-medium text-foreground">Pay As You Go</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">This Month</span>
                  <span className="text-sm font-medium text-foreground">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Calls</span>
                  <span className="text-sm font-medium text-foreground">0</span>
                </div>
              </div>
            </Card>
          </SidebarFooter>
        )}
      </SidebarContent>
    </Sidebar>
  );
}