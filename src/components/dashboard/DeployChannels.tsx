import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Globe, MessageCircle, Smartphone, Code, ExternalLink, Copy } from "lucide-react";
import { DashboardView } from "@/pages/Dashboard";

interface DeployChannelsProps {
  currentChannel: DashboardView;
}

const channelConfig = {
  "phone-numbers": {
    title: "Phone Numbers",
    icon: Phone,
    description: "Deploy your agents on phone lines for voice-based interactions",
    setupSteps: [
      "Connect your phone provider or get a VoxHive number",
      "Configure call routing and fallback options",
      "Test your agent with a test call",
      "Go live and start receiving calls"
    ],
    codeExample: `// Initialize phone agent
const phoneAgent = await voxhive.deploy({
  channel: 'phone',
  number: '+1234567890',
  agentId: 'your-agent-id'
});`
  },
  "website-widget": {
    title: "Website Widget",
    icon: Globe,
    description: "Embed a voice-enabled widget on your website for instant customer engagement",
    setupSteps: [
      "Copy the widget embed code",
      "Paste before closing </body> tag on your site",
      "Customize appearance and position",
      "Deploy and start engaging visitors"
    ],
    codeExample: `<!-- Add to your website -->
<script src="https://cdn.voxhive.ai/widget.js"></script>
<script>
  VoxHive.init({
    agentId: 'your-agent-id',
    position: 'bottom-right'
  });
</script>`
  },
  "whatsapp": {
    title: "WhatsApp",
    icon: MessageCircle,
    description: "Connect your agent to WhatsApp for voice and text conversations",
    setupSteps: [
      "Connect your WhatsApp Business account",
      "Configure message templates and voice flow",
      "Test with a sample conversation",
      "Launch and engage with customers"
    ],
    codeExample: `// WhatsApp deployment config
const whatsappAgent = await voxhive.deploy({
  channel: 'whatsapp',
  businessNumber: '+1234567890',
  agentId: 'your-agent-id',
  features: ['voice', 'text']
});`
  },
  "mobile-app": {
    title: "Mobile App",
    icon: Smartphone,
    description: "Integrate voice agents into your iOS and Android applications",
    setupSteps: [
      "Install VoxHive SDK for your platform",
      "Initialize with your API credentials",
      "Implement voice interface components",
      "Test and publish your app"
    ],
    codeExample: `// React Native example
import { VoxHive } from '@voxhive/react-native';

const agent = new VoxHive({
  apiKey: 'your-api-key',
  agentId: 'your-agent-id'
});

await agent.startConversation();`
  },
  "api": {
    title: "API Integration",
    icon: Code,
    description: "Use our REST API and WebSocket connections for custom integrations",
    setupSteps: [
      "Generate your API key from settings",
      "Review API documentation and endpoints",
      "Implement authentication and endpoints",
      "Test and deploy your integration"
    ],
    codeExample: `// API request example
const response = await fetch('https://api.voxhive.ai/v1/conversation', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agentId: 'your-agent-id',
    action: 'start'
  })
});`
  }
};

export function DeployChannels({ currentChannel }: DeployChannelsProps) {
  const config = channelConfig[currentChannel as keyof typeof channelConfig];
  
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{config.title}</h1>
        </div>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Setup Steps */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Setup Steps</h2>
          <ol className="space-y-3">
            {config.setupSteps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </Badge>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
          <Button className="w-full mt-6">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Documentation
          </Button>
        </Card>

        {/* Code Example */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Code Example</h2>
            <Button variant="ghost" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{config.codeExample}</code>
          </pre>
        </Card>
      </div>

      {/* Quick Start */}
      <Card className="p-6 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Ready to Deploy?</h3>
            <p className="text-sm text-muted-foreground">
              Get your agent live on {config.title} in under 5 minutes
            </p>
          </div>
          <Button size="lg">
            Start Deployment
          </Button>
        </div>
      </Card>
    </div>
  );
}
