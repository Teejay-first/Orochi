// Webhooks View - Manage server URLs and webhooks
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Webhook } from "lucide-react";

export function Webhooks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Webhook className="w-6 h-6" />
            Webhooks & Server URLs
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure event delivery endpoints for your assistants
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Webhook management coming soon</p>
          <p className="text-sm text-muted-foreground">
            Configure server URLs to receive real-time event notifications
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
