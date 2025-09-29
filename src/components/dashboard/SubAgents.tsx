import { useState } from "react";
import { Bot, Plus, Search, Link2, Unlink, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SubAgent {
  id: string;
  name: string;
  description: string;
  assignedTo: string[];
  status: "active" | "inactive";
  capabilities: string[];
}

const demoSubAgents: SubAgent[] = [
  {
    id: "1",
    name: "Lead Qualifier",
    description: "Qualifies incoming leads based on predefined criteria",
    assignedTo: ["Sales Agent", "Customer Support Agent"],
    status: "active",
    capabilities: ["Lead Scoring", "Data Validation", "CRM Integration"],
  },
  {
    id: "2",
    name: "Product Recommender",
    description: "Provides personalized product recommendations",
    assignedTo: ["E-commerce Agent"],
    status: "active",
    capabilities: ["Product Matching", "Preference Learning", "Inventory Check"],
  },
  {
    id: "3",
    name: "Appointment Scheduler",
    description: "Handles appointment booking and calendar management",
    assignedTo: ["Sales Agent", "Support Agent", "Medical Agent"],
    status: "active",
    capabilities: ["Calendar Integration", "Timezone Management", "Reminders"],
  },
];

export function SubAgents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subAgents] = useState<SubAgent[]>(demoSubAgents);

  const filteredSubAgents = subAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sub-Agents</h2>
          <p className="text-muted-foreground mt-1">
            Modular agents that can be assigned to multiple parent agents
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Sub-Agent
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search sub-agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Capabilities</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubAgents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{agent.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm text-muted-foreground truncate">
                    {agent.description}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {agent.assignedTo.length > 0 ? (
                      agent.assignedTo.slice(0, 2).map((parentAgent, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {parentAgent}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not assigned</span>
                    )}
                    {agent.assignedTo.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.assignedTo.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 2).map((capability, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                    {agent.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link2 className="w-4 h-4 mr-2" />
                        Assign to Agents
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bot className="w-4 h-4 mr-2" />
                        Configure
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Unlink className="w-4 h-4 mr-2" />
                        Unassign All
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Sub-Agents</CardTitle>
          <CardDescription>
            Understanding the multi-agentic framework
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">What are Sub-Agents?</h4>
            <p className="text-sm text-muted-foreground">
              Sub-agents are specialized, modular agents that can be assigned to multiple parent agents. 
              They handle specific tasks and can be reused across your agent ecosystem, enabling a true 
              multi-agentic framework with shared capabilities.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Key Benefits</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>One sub-agent can serve multiple parent agents</li>
              <li>Centralized updates propagate to all assigned agents</li>
              <li>Reduce redundancy and maintain consistency</li>
              <li>Enable specialized expertise across your agent fleet</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
