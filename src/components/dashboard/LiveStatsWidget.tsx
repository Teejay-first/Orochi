import { useState, useEffect } from "react";
import { Activity, DollarSign, Phone, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/services/callApi";

export function LiveStatsWidget() {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getAnalyticsSummary();
      setStats(data);
    } catch (error) {
      console.error('Error fetching live stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="w-2 h-2 rounded-full bg-success shrink-0" />
          <span>Live Usage Monitor</span>
          <Badge variant="outline" className="ml-auto text-xs font-normal">Updates every 5s</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="w-3.5 h-3.5" />
              Active Calls
            </div>
            <div className="text-2xl font-semibold text-foreground">{stats.active_calls}</div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              Calls Today
            </div>
            <div className="text-2xl font-semibold text-foreground">{stats.total_calls_today}</div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="w-3.5 h-3.5" />
              Spent Today
            </div>
            <div className="text-2xl font-semibold text-foreground">${stats.cost_today.toFixed(2)}</div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Coins className="w-3.5 h-3.5" />
              Tokens Today
            </div>
            <div className="text-2xl font-semibold text-foreground">{stats.total_tokens_today.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
