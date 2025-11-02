// Usage & Cost View - Priority analytics dashboard
import { useState, useEffect } from "react";
import { useProvider } from "@/contexts/ProviderContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Zap, Phone, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UsageStats {
  totalCost: number;
  totalCalls: number;
  totalTokens: number;
  totalMinutes: number;
  costToday: number;
  callsToday: number;
  tokensToday: number;
  avgCostPerCall: number;
}

interface AssistantUsage {
  assistantId: string;
  assistantName: string;
  provider: string;
  calls: number;
  cost: number;
  avgCostPerCall: number;
}

export function UsageCost() {
  const { activeConnection } = useProvider();
  const [stats, setStats] = useState<UsageStats>({
    totalCost: 0,
    totalCalls: 0,
    totalTokens: 0,
    totalMinutes: 0,
    costToday: 0,
    callsToday: 0,
    tokensToday: 0,
    avgCostPerCall: 0,
  });
  const [assistantUsage, setAssistantUsage] = useState<AssistantUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeConnection) {
      loadUsageData();
    }
  }, [activeConnection]);

  async function loadUsageData() {
    try {
      setLoading(true);

      // Fetch calls data
      const { data: calls, error } = await supabase
        .from('vapi_calls')
        .select('*, agents(name)')
        .eq('provider_connection_id', activeConnection?.id || '');

      if (error) throw error;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Calculate overall stats
      const totalCost = calls?.reduce((sum, call) => sum + (call.cost || 0), 0) || 0;
      const totalCalls = calls?.length || 0;
      const totalMinutes = calls?.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) / 60 || 0;

      const callsToday = calls?.filter(c => new Date(c.started_at) >= todayStart) || [];
      const costToday = callsToday.reduce((sum, call) => sum + (call.cost || 0), 0);

      setStats({
        totalCost,
        totalCalls,
        totalTokens: 0, // Will calculate from cost_breakdown if available
        totalMinutes,
        costToday,
        callsToday: callsToday.length,
        tokensToday: 0,
        avgCostPerCall: totalCalls > 0 ? totalCost / totalCalls : 0,
      });

      // Calculate per-assistant usage
      const assistantMap = new Map<string, AssistantUsage>();
      calls?.forEach(call => {
        const agentId = call.agent_id;
        if (!agentId) return;

        const existing = assistantMap.get(agentId) || {
          assistantId: agentId,
          assistantName: (call.agents as any)?.name || 'Unknown',
          provider: 'vapi',
          calls: 0,
          cost: 0,
          avgCostPerCall: 0,
        };

        existing.calls += 1;
        existing.cost += call.cost || 0;
        existing.avgCostPerCall = existing.cost / existing.calls;

        assistantMap.set(agentId, existing);
      });

      setAssistantUsage(Array.from(assistantMap.values()).sort((a, b) => b.cost - a.cost));
    } catch (err) {
      console.error('Error loading usage data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading usage data...</div>
      </div>
    );
  }

  if (!activeConnection) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No active provider connection</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add a provider connection in Settings to view usage data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Usage & Cost
          </h1>
          <p className="text-muted-foreground mt-1">
            Track spending and usage across all assistants
          </p>
        </div>
        <Badge variant="outline">Last 30 days</Badge>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+${stats.costToday.toFixed(2)}</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.callsToday}</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.totalMinutes)}</div>
            <p className="text-xs text-muted-foreground">
              Avg {stats.totalCalls > 0 ? (stats.totalMinutes / stats.totalCalls).toFixed(1) : 0} min/call
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Call</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgCostPerCall.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">Per conversation</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown by Assistant */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown by Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          {assistantUsage.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No usage data available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assistant</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Cost (30d)</TableHead>
                  <TableHead className="text-right">Avg/Call</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assistantUsage.map((usage) => (
                  <TableRow key={usage.assistantId}>
                    <TableCell className="font-medium">{usage.assistantName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {usage.provider === 'vapi' ? '🟣 Vapi' : usage.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{usage.calls}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${usage.cost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ${usage.avgCostPerCall.toFixed(3)}
                    </TableCell>
                    <TableCell>
                      {usage.cost > stats.avgCostPerCall ? (
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cost Trends (Placeholder for now) */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Cost Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart visualization coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
