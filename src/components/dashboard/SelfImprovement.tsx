import { useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  StackedNormalizedAreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  StackedNormalizedAreaSeries,
  Line,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
  ChartDataTypes,
} from "reaviz";
import { TrendingUp, Target, Zap, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChartDataPoint {
  key: Date;
  data: number | null | undefined;
}

interface ChartSeries {
  key: string;
  data: ChartDataPoint[];
}

interface LegendItem {
  name: string;
  color: string;
}

interface TimePeriodOption {
  value: string;
  label: string;
}

interface ImprovementStat {
  id: string;
  title: string;
  count: number;
  countFrom?: number;
  comparisonText: string;
  percentage: number;
  TrendIconSvg: React.FC<{ strokeColor: string }>;
  trendColor: string;
  trendBgColor: string;
}

interface DetailedMetric {
  id: string;
  Icon: React.FC<{ className?: string }>;
  label: string;
  tooltip: string;
  value: string;
  TrendIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }>;
  trendBaseColor: string;
  trendStrokeColor: string;
  delay: number;
}

const TrendUpIcon: React.FC<{ strokeColor: string }> = ({ strokeColor }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
    <path d="M5.50134 9.11119L10.0013 4.66675M10.0013 4.66675L14.5013 9.11119M10.0013 4.66675L10.0013 16.3334" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const DetailedTrendUpIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="14" fill={baseColor} fillOpacity="0.4" />
    <path d="M9.50134 12.6111L14.0013 8.16663M14.0013 8.16663L18.5013 12.6111M14.0013 8.16663L14.0013 19.8333" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const LEGEND_ITEMS: LegendItem[] = [
  { name: 'Accuracy', color: '#C8F0E9' },
  { name: 'Response Quality', color: '#40E5D1' },
  { name: 'User Satisfaction', color: '#00B89C' },
];

const CHART_COLOR_SCHEME = ['#C8F0E9', '#40E5D1', '#00B89C'];

const TIME_PERIOD_OPTIONS: TimePeriodOption[] = [
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'last-90-days', label: 'Last 90 Days' },
];

const now = new Date();
const generateDate = (offsetDays: number): Date => {
  const date = new Date(now);
  date.setDate(now.getDate() - offsetDays);
  return date;
};

const initialMultiDateData: ChartSeries[] = [
  {
    key: 'Accuracy',
    data: Array.from({ length: 7 }, (_, i) => ({ 
      key: generateDate(6 - i), 
      data: Math.floor(Math.random() * 15) + 70 
    })),
  },
  {
    key: 'Response Quality',
    data: Array.from({ length: 7 }, (_, i) => ({ 
      key: generateDate(6 - i), 
      data: Math.floor(Math.random() * 15) + 75 
    })),
  },
  {
    key: 'User Satisfaction',
    data: Array.from({ length: 7 }, (_, i) => ({ 
      key: generateDate(6 - i), 
      data: Math.floor(Math.random() * 10) + 80 
    })),
  },
];

const validateChartData = (data: ChartSeries[]): any[] => {
  return data.map(series => ({
    ...series,
    data: series.data.map(item => ({
      ...item,
      data: (typeof item.data !== 'number' || isNaN(item.data)) ? 0 : item.data,
    })),
  }));
};

const validatedChartData: any = validateChartData(initialMultiDateData);

const IMPROVEMENT_STATS_DATA: ImprovementStat[] = [
  {
    id: 'accuracy',
    title: 'Overall Accuracy',
    count: 94.2,
    countFrom: 0,
    comparisonText: 'Compared to 89.1% last month',
    percentage: 5.7,
    TrendIconSvg: TrendUpIcon,
    trendColor: 'text-[#40E5D1]',
    trendBgColor: 'bg-[rgb(64,229,209)]/40',
  },
  {
    id: 'improvements',
    title: 'Improvements Made',
    count: 47,
    countFrom: 0,
    comparisonText: 'Based on user feedback & A/B testing',
    percentage: 12,
    TrendIconSvg: TrendUpIcon,
    trendColor: 'text-[#40E5D1]',
    trendBgColor: 'bg-[rgb(64,229,209)]/40',
  },
];

const DETAILED_METRICS_DATA: DetailedMetric[] = [
  {
    id: 'response-time',
    Icon: Zap,
    label: 'Avg Response Time',
    tooltip: 'Average Response Time',
    value: '1.2s',
    TrendIcon: DetailedTrendUpIcon,
    trendBaseColor: '#40E5D1',
    trendStrokeColor: '#40E5D1',
    delay: 0,
  },
  {
    id: 'accuracy-rate',
    Icon: Target,
    label: 'Intent Recognition',
    tooltip: 'Intent Recognition Accuracy',
    value: '96.8%',
    TrendIcon: DetailedTrendUpIcon,
    trendBaseColor: '#40E5D1',
    trendStrokeColor: '#40E5D1',
    delay: 0.05,
  },
  {
    id: 'learning-rate',
    Icon: TrendingUp,
    label: 'Learning Velocity',
    tooltip: 'Rate of Improvement',
    value: '+12%/mo',
    TrendIcon: DetailedTrendUpIcon,
    trendBaseColor: '#40E5D1',
    trendStrokeColor: '#40E5D1',
    delay: 0.1,
  },
];

export function SelfImprovement() {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>(TIME_PERIOD_OPTIONS[0].value);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Self-Improvement</h2>
        <p className="text-muted-foreground mt-1">
          Track agent accuracy and performance improvements over time
        </p>
      </div>

      <style>{`
        :root {
          --reaviz-tick-fill: #9A9AAF;
          --reaviz-gridline-stroke: #7E7E8F75;
        }
        .dark {
          --reaviz-tick-fill: #A0AEC0;
          --reaviz-gridline-stroke: rgba(74, 85, 104, 0.6);
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Performance Trends</h3>
                <select
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  className="bg-muted text-foreground px-3 py-2 rounded-md focus:ring-2 focus:ring-primary outline-none"
                  aria-label="Select time period"
                >
                  {TIME_PERIOD_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-6 mb-4">
                {LEGEND_ITEMS.map((item) => (
                  <div key={item.name} className="flex gap-2 items-center">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground text-sm">{item.name}</span>
                  </div>
                ))}
              </div>

              <div className="h-[280px]">
                <StackedNormalizedAreaChart
                  height={280}
                  id="self-improvement-chart"
                  data={validatedChartData}
                  xAxis={
                    <LinearXAxis
                      type="time"
                      tickSeries={
                        <LinearXAxisTickSeries
                          label={
                            <LinearXAxisTickLabel
                              format={v => new Date(v).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                              fill="var(--reaviz-tick-fill)"
                            />
                          }
                          tickSize={10}
                        />
                      }
                    />
                  }
                  yAxis={
                    <LinearYAxis
                      axisLine={null}
                      tickSeries={<LinearYAxisTickSeries line={null} label={null} tickSize={10} />}
                    />
                  }
                  series={
                    <StackedNormalizedAreaSeries
                      line={<Line strokeWidth={3} glow={{ blur: 10 }} />}
                      area={
                        <Area
                          glow={{ blur: 20 }}
                          gradient={
                            <Gradient
                              stops={[
                                <GradientStop key={1} stopOpacity={0} />,
                                <GradientStop key={2} offset="80%" stopOpacity={0.2} />,
                              ]}
                            />
                          }
                        />
                      }
                      colorScheme={CHART_COLOR_SCHEME}
                    />
                  }
                  gridlines={<GridlineSeries line={<Gridline strokeColor="var(--reaviz-gridline-stroke)" />} />}
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t">
                {IMPROVEMENT_STATS_DATA.map(stat => (
                  <div key={stat.id} className="flex flex-col gap-2">
                    <span className="text-lg text-muted-foreground">{stat.title}</span>
                    <div className="flex items-center gap-2">
                      <CountUp
                        className="font-mono text-3xl font-semibold"
                        start={stat.countFrom || 0}
                        end={stat.count}
                        duration={2.5}
                        decimals={stat.id === 'accuracy' ? 1 : 0}
                        suffix={stat.id === 'accuracy' ? '%' : ''}
                      />
                      <div className={`flex ${stat.trendBgColor} px-2 py-1 items-center rounded-full ${stat.trendColor}`}>
                        <stat.TrendIconSvg strokeColor={stat.trendColor === 'text-[#40E5D1]' ? '#40E5D1' : '#40E5D1'} />
                        {stat.percentage}%
                      </div>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {stat.comparisonText}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col divide-y mt-6 pt-6 border-t">
                {DETAILED_METRICS_DATA.map((metric) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: metric.delay }}
                    className="flex w-full py-4 items-center gap-2"
                  >
                    <div className="flex flex-row gap-2 items-center text-base w-1/2 text-muted-foreground">
                      <metric.Icon className="w-5 h-5" />
                      <span className="truncate" title={metric.tooltip}>
                        {metric.label}
                      </span>
                    </div>
                    <div className="flex gap-2 w-1/2 justify-end items-center">
                      <span className="font-semibold text-xl font-mono">{metric.value}</span>
                      <metric.TrendIcon baseColor={metric.trendBaseColor} strokeColor={metric.trendStrokeColor} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Pending Reviews
              </CardTitle>
              <CardDescription>Items requiring expert feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium">Conversation #1247</p>
                  <Badge variant="secondary" className="text-xs">Medical</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Agent provided diagnosis - requires specialist review
                </p>
                <div className="flex gap-2">
                  <button className="text-xs text-primary hover:underline">Review</button>
                  <span className="text-xs text-muted-foreground">•</span>
                  <button className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium">Edge Case #892</p>
                  <Badge variant="secondary" className="text-xs">Legal</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Unusual request pattern detected - needs validation
                </p>
                <div className="flex gap-2">
                  <button className="text-xs text-primary hover:underline">Review</button>
                  <span className="text-xs text-muted-foreground">•</span>
                  <button className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
              <CardDescription>Active experiments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Greeting Style Test</span>
                  <Badge variant="outline" className="text-xs">Running</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Variant A: 87% satisfaction</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Variant B: 91% satisfaction</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Length</span>
                  <Badge variant="outline" className="text-xs">Running</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Short: 84% completion</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Detailed: 79% completion</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Self-Improvement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Our self-improving system continuously learns from interactions, expert feedback, 
                and A/B testing to enhance agent accuracy and performance.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Autonomous learning from conversations</li>
                <li>Expert-in-the-loop validation</li>
                <li>Continuous A/B testing</li>
                <li>Version control & rollback</li>
                <li>Long-term memory & personalization</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
