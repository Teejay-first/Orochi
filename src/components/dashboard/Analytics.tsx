import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Clock, Phone, DollarSign, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useProvider } from "@/contexts/ProviderContext";
import type { VapiCall } from "@/services/vapi/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
  totalCalls: number;
  totalMinutes: number;
  activeAgents: number;
  avgCallDuration: number;
  callsToday: number;
  callsThisWeek: number;
  successRate: number;
}

export function Analytics() {
  const { getVapiClient } = useProvider();
  const [data, setData] = useState<AnalyticsData>({
    totalCalls: 0,
    totalMinutes: 0,
    activeAgents: 0,
    avgCallDuration: 0,
    callsToday: 0,
    callsThisWeek: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<VapiCall[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    fetchAnalytics();

    // Poll for stats every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const client = getVapiClient();
      if (!client) {
        toast({
          title: "No Vapi connection",
          description: "Please connect your Vapi account in Settings",
          variant: "destructive",
        });
        return;
      }

      console.log('📊 Fetching analytics from Vapi...');

      // Fetch calls and assistants
      const [callsData, assistants] = await Promise.all([
        client.listCalls(),
        client.listAssistants()
      ]);

      console.log('📋 Fetched calls:', callsData.length);
      console.log('📋 Fetched assistants:', assistants.length);

      setCalls(callsData);

      // Calculate analytics
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalCalls = callsData.length;
      const completedCalls = callsData.filter(c => c.status === 'ended') || [];
      const activeAgents = assistants.length;

      // Calculate call durations and costs
      let totalMinutes = 0;
      let totalCostCalc = 0;

      completedCalls.forEach(call => {
        if (call.endedAt && call.startedAt) {
          const duration = (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000 / 60;
          totalMinutes += duration;
        }

        // Vapi call cost (if available)
        if (call.cost) {
          totalCostCalc += call.cost;
        }
      });

      const avgCallDuration = completedCalls.length > 0 ? totalMinutes / completedCalls.length : 0;

      const callsToday = callsData.filter(c => c.createdAt && new Date(c.createdAt) >= todayStart).length;
      const callsThisWeek = callsData.filter(c => c.createdAt && new Date(c.createdAt) >= weekStart).length;
      const successRate = totalCalls > 0 ? (completedCalls.length / totalCalls) * 100 : 100;

      setData({
        totalCalls,
        totalMinutes,
        activeAgents,
        avgCallDuration,
        callsToday,
        callsThisWeek,
        successRate,
      });

      setTotalCost(totalCostCalc);

      console.log('✅ Analytics calculated:', {
        totalCalls,
        totalMinutes,
        activeAgents,
        avgCallDuration,
        callsToday,
        callsThisWeek,
        successRate,
        totalCost: totalCostCalc
      });

    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      toast({
        title: "Failed to load analytics",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics
        </h1>
        <Badge variant="outline">Last 30 days</Badge>
      </div>

      {/* Live Stats Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Stats
            <Badge variant="outline" className="ml-auto">Updates every 30s</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Calls</p>
              <p className="text-2xl font-bold">{data.totalCalls}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Calls Today</p>
              <p className="text-2xl font-bold">{data.callsToday}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Agents</p>
              <p className="text-2xl font-bold">{data.activeAgents}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.callsToday}</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.totalMinutes)}</div>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(data.avgCallDuration * 10) / 10} min/call
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeAgents}</div>
            <p className="text-xs text-muted-foreground">Currently deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.successRate)}%</div>
            <p className="text-xs text-muted-foreground">Call completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No calls found in your Vapi account</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make a test call to see usage analytics here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assistant</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.slice(0, 10).map((call) => {
                  const duration = call.endedAt && call.startedAt
                    ? (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000 / 60
                    : 0;

                  return (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">
                        {call.assistant?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {call.createdAt
                          ? formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {duration > 0 ? `${Math.round(duration)} min` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          {call.cost ? call.cost.toFixed(4) : '0.00'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            call.status === 'in-progress'
                              ? 'default'
                              : call.status === 'ended'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {call.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calls this week</span>
              <span className="font-medium">{data.callsThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calls today</span>
              <span className="font-medium">{data.callsToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg call duration</span>
              <span className="font-medium">{Math.round(data.avgCallDuration * 10) / 10} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Success rate</span>
              <span className="font-medium">{Math.round(data.successRate)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="font-medium">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Calls</span>
                <span className="font-medium">{data.totalCalls}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Cost per Call</span>
                <span className="font-medium">
                  ${data.totalCalls > 0 ? (totalCost / data.totalCalls).toFixed(4) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Minutes</span>
                <span className="font-medium">{Math.round(data.totalMinutes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}