import { Agent } from "@/types/agent";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentFlowChartProps {
  agent: Agent;
}

export function AgentFlowChart({ agent }: AgentFlowChartProps) {
  return (
    <Card className="h-[600px]">
      <CardContent className="p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Flow Chart Header */}
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold">Conversation Flow</h3>
            <Badge variant="secondary">Visual Editor</Badge>
          </div>

          {/* Simplified Flow Visualization */}
          <div className="flex-1 flex flex-col justify-center items-center space-y-8 bg-muted/20 rounded-lg p-8">
            {/* Start Node */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                Start
              </div>
              <div className="text-sm text-muted-foreground mt-2">Call initiated</div>
            </div>

            {/* Arrow Down */}
            <div className="w-0.5 h-12 bg-border"></div>

            {/* Greeting Node */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white font-medium">
                Greeting
              </div>
              <div className="text-sm text-muted-foreground mt-2 max-w-xs text-center">
                Welcome message and initial agent introduction
              </div>
            </div>

            {/* Arrow Down */}
            <div className="w-0.5 h-12 bg-border"></div>

            {/* Main Conversation */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-20 bg-purple-500 rounded-lg flex items-center justify-center text-white font-medium text-center">
                Main<br/>Conversation
              </div>
              <div className="text-sm text-muted-foreground mt-2 max-w-xs text-center">
                Agent handles user inquiries based on prompt and knowledge
              </div>
            </div>

            {/* Arrow Down */}
            <div className="w-0.5 h-12 bg-border"></div>

            {/* End Node */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                End
              </div>
              <div className="text-sm text-muted-foreground mt-2">Call completed</div>
            </div>
          </div>

          {/* Flow Stats */}
          <div className="flex justify-between mt-6 text-sm text-muted-foreground">
            <span>4 nodes • 3 connections</span>
            <span>Avg duration: 3-5 minutes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}