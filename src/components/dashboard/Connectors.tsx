import { useState } from "react";
import { Plug, Mail, Calendar, FileText, Database, MessageSquare, ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  status: "connected" | "available" | "coming-soon";
  category: string;
}

const availableConnectors: Connector[] = [
  {
    id: "gmail",
    name: "Gmail with Calendar",
    description: "Search, create, and manage your emails and calendar events",
    icon: Mail,
    iconColor: "text-red-500",
    status: "available",
    category: "Communication",
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Search your emails and calendar events",
    icon: Mail,
    iconColor: "text-blue-500",
    status: "available",
    category: "Communication",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Connect your account to include Google Drive files in search results",
    icon: FileText,
    iconColor: "text-yellow-500",
    status: "available",
    category: "Storage",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Connect your account to include Dropbox files in search results",
    icon: FileText,
    iconColor: "text-blue-600",
    status: "available",
    category: "Storage",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Plan and track projects, issues, and team workflows in Linear",
    icon: Database,
    iconColor: "text-purple-500",
    status: "available",
    category: "Project Management",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Search and create content on your Notion pages",
    icon: FileText,
    iconColor: "text-gray-700",
    status: "available",
    category: "Productivity",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect to your Slack workspace for message history",
    icon: MessageSquare,
    iconColor: "text-purple-600",
    status: "available",
    category: "Communication",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Connect your Shopify store for product and order management",
    icon: ShoppingCart,
    iconColor: "text-green-600",
    status: "available",
    category: "E-commerce",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Access CRM data, leads, and customer information",
    icon: Database,
    iconColor: "text-blue-400",
    status: "coming-soon",
    category: "CRM",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Connect your HubSpot CRM and marketing tools",
    icon: Database,
    iconColor: "text-orange-500",
    status: "coming-soon",
    category: "CRM",
  },
];

export function Connectors() {
  const [connectors, setConnectors] = useState<Connector[]>(availableConnectors);
  const [customConnectorName, setCustomConnectorName] = useState("");
  const [customConnectorDetails, setCustomConnectorDetails] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEnableConnector = (id: string) => {
    setConnectors(
      connectors.map((c) =>
        c.id === id ? { ...c, status: "connected" as const } : c
      )
    );
  };

  const handleDisableConnector = (id: string) => {
    setConnectors(
      connectors.map((c) =>
        c.id === id ? { ...c, status: "available" as const } : c
      )
    );
  };

  const handleCustomConnectorRequest = () => {
    // Here you would typically send this to your backend
    console.log("Custom connector request:", {
      name: customConnectorName,
      details: customConnectorDetails,
    });
    setDialogOpen(false);
    setCustomConnectorName("");
    setCustomConnectorDetails("");
  };

  const myConnectors = connectors.filter((c) => c.status === "connected");
  const availableToConnect = connectors.filter((c) => c.status === "available");
  const comingSoon = connectors.filter((c) => c.status === "coming-soon");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Connectors</h2>
          <p className="text-muted-foreground mt-1">
            Connect your operating system and installed apps to VoxHive
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Request Custom Connector
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a Custom Connector</DialogTitle>
              <DialogDescription>
                Can't find the connector you need? Let us know and we'll build it for you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="connector-name">Service Name</Label>
                <Input
                  id="connector-name"
                  placeholder="e.g., Zendesk, Intercom, Custom API"
                  value={customConnectorName}
                  onChange={(e) => setCustomConnectorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="connector-details">Details & Use Case</Label>
                <Textarea
                  id="connector-details"
                  placeholder="Tell us what you'd like to connect and how you plan to use it..."
                  value={customConnectorDetails}
                  onChange={(e) => setCustomConnectorDetails(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomConnectorRequest}>
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {myConnectors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Connected</h3>
          <div className="space-y-3">
            {myConnectors.map((connector) => (
              <Card key={connector.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded flex items-center justify-center bg-muted`}>
                      <connector.icon className={`w-6 h-6 ${connector.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{connector.name}</h4>
                        <Badge variant="default" className="text-xs">Connected</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{connector.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisableConnector(connector.id)}
                  >
                    Disconnect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {myConnectors.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plug className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect your apps to start using them with VoxHive</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Enable connectors below to integrate with your favorite tools and unlock powerful AI capabilities
            </p>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Available Connectors</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your operating system and installed apps to VoxHive
        </p>
        <div className="space-y-3">
          {availableToConnect.map((connector) => (
            <Card key={connector.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded flex items-center justify-center bg-muted`}>
                    <connector.icon className={`w-6 h-6 ${connector.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{connector.name}</h4>
                    <p className="text-sm text-muted-foreground">{connector.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEnableConnector(connector.id)}
                >
                  Enable
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {comingSoon.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
          <div className="space-y-3">
            {comingSoon.map((connector) => (
              <Card key={connector.id} className="opacity-60">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded flex items-center justify-center bg-muted`}>
                      <connector.icon className={`w-6 h-6 ${connector.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{connector.name}</h4>
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{connector.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Connectors</CardTitle>
          <CardDescription>
            Robust & secure integrations for your agent ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Our Connector Infrastructure</h4>
            <p className="text-sm text-muted-foreground">
              VoxHive's connectors are built with enterprise-grade security and robustness. Each integration 
              is thoroughly tested and maintained to ensure reliable, secure access to your data.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Key Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>OAuth 2.0 secure authentication</li>
              <li>End-to-end encryption for data in transit</li>
              <li>Real-time synchronization</li>
              <li>Granular permission controls</li>
              <li>API-friendly implementation for programmatic setup</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
