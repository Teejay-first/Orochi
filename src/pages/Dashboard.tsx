import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AgentDirectory } from "@/components/dashboard/AgentDirectory";
import { SubAgents } from "@/components/dashboard/SubAgents";
import { Connectors } from "@/components/dashboard/Connectors";
import { SelfImprovement } from "@/components/dashboard/SelfImprovement";
import { CallHistory } from "@/components/dashboard/CallHistory";
import { Analytics } from "@/components/dashboard/Analytics";
import { AgentConfiguration } from "@/components/dashboard/AgentConfiguration";
import { KnowledgeBase } from "@/components/dashboard/KnowledgeBase";
import { PhoneNumbers } from "@/components/dashboard/PhoneNumbers";
import { DeployChannels } from "@/components/dashboard/DeployChannels";
import { PopularUseCases } from "@/components/dashboard/PopularUseCases";

export type DashboardView = 
  | "agents" 
  | "sub-agents"
  | "connectors"
  | "self-improvement"
  | "knowledge-base"
  | "use-cases"
  | "phone-numbers"
  | "website-widget"
  | "whatsapp"
  | "mobile-app"
  | "api"
  | "call-history" 
  | "analytics"
  | "agent-config";

export const Dashboard = () => {
  const [currentView, setCurrentView] = useState<DashboardView>("agents");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const renderContent = () => {
    switch (currentView) {
      case "agents":
        return (
          <AgentDirectory 
            onConfigureAgent={(agentId) => {
              setSelectedAgentId(agentId);
              setCurrentView("agent-config");
            }}
          />
        );
      case "sub-agents":
        return <SubAgents />;
      case "connectors":
        return <Connectors />;
      case "self-improvement":
        return <SelfImprovement />;
      case "agent-config":
        return (
          <AgentConfiguration 
            agentId={selectedAgentId}
            onBack={() => setCurrentView("agents")}
          />
        );
      case "knowledge-base":
        return <KnowledgeBase />;
      case "use-cases":
        return <PopularUseCases />;
      case "phone-numbers":
      case "website-widget":
      case "whatsapp":
      case "mobile-app":
      case "api":
        return <DeployChannels currentChannel={currentView} />;
      case "call-history":
        return <CallHistory />;
      case "analytics":
        return <Analytics />;
      default:
        return <AgentDirectory onConfigureAgent={() => {}} />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
        />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};