'use client';

import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TimeMode = 'week' | 'month' | 'year';
export type DataTab = 'overview' | 'jobViews' | 'jobApplications';

export interface StatsDataPoint {
  label: string;
  jobViews: number;
  jobApplications: number;
}

export interface StatsSummary {
  totalJobViews: number;
  totalJobApplications: number;
  jobViewsDiff: number; // percentage change vs previous period
  jobApplicationsDiff: number; // percentage change vs previous period
}

export interface StatsDataSet {
  data: StatsDataPoint[];
  summary: StatsSummary;
  periodLabel: string; // e.g. "Jul 19-25"
}

export interface DashboardStatsPanelProps {
  weekData: StatsDataSet;
  monthData: StatsDataSet;
  yearData: StatsDataSet;
  className?: string;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Chart config                                                       */
/* ------------------------------------------------------------------ */

const chartConfig = {
  jobViews: {
    label: 'Job Views',
    color: 'var(--orange-400)',
  },
  jobApplications: {
    label: 'Job Applications',
    color: 'var(--purple-500)',
  },
} satisfies ChartConfig;

/* ------------------------------------------------------------------ */
/*  Summary card (right side)                                          */
/* ------------------------------------------------------------------ */

function SummaryCard({
  title,
  total,
  diff,
  periodLabel,
  icon: Icon,
  iconBg,
}: {
  title: string;
  total: number;
  diff: number;
  periodLabel: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
}) {
  const isPositive = diff >= 0;

  return (
    <Card className="flex-1 shadow-none">
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between">
          <span className="label-label-2-medium text-muted-foreground">
            {title}
          </span>
          <div className={cn('rounded-full p-1.5', iconBg)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <span className="heading-h2-bold">{total.toLocaleString()}</span>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">{periodLabel}</span>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium',
              isPositive ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(diff).toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function DashboardStatsPanel({
  weekData,
  monthData,
  yearData,
  className,
  isLoading = false,
  onRefresh,
  error,
}: DashboardStatsPanelProps) {
  const [timeMode, setTimeMode] = useState<TimeMode>('week');
  const [dataTab, setDataTab] = useState<DataTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentDataSet = useMemo(() => {
    switch (timeMode) {
      case 'week':
        return weekData;
      case 'month':
        return monthData;
      case 'year':
        return yearData;
    }
  }, [timeMode, weekData, monthData, yearData]);

  const timeModeLabel =
    timeMode === 'week'
      ? 'This Week'
      : timeMode === 'month'
      ? 'This Month'
      : 'This Year';

  return (
    <Card className={cn('w-full', className, error && 'border-red-300')}>
      <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="heading-h6-semi-bold">Job statistics</CardTitle>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Showing job statistics for {currentDataSet.periodLabel}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-medium transition-colors',
                isRefreshing || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50'
              )}
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
              Refresh
            </button>
          )}

          {/* Time mode selector */}
          <div className="inline-flex rounded-lg border p-1">
            {(['week', 'month', 'year'] as TimeMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeMode(mode)}
                disabled={isLoading}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors',
                  timeMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-muted-foreground hover:text-foreground',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[280px] text-muted-foreground">
            Loading statistics...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[280px] rounded-lg border border-red-200 bg-red-50">
            <div className="text-center">
              <p className="text-red-800 font-medium">{error}</p>
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Data tab selector */}
            <Tabs
              value={dataTab}
              onValueChange={(v) => setDataTab(v as DataTab)}
            >
              <TabsList className="bg-transparent p-0 h-auto gap-4 border-b rounded-none w-full justify-start">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-0 pb-2 shadow-none data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="jobViews"
                  className="rounded-none border-b-2 border-transparent px-0 pb-2 shadow-none data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
                >
                  Job Views
                </TabsTrigger>
                <TabsTrigger
                  value="jobApplications"
                  className="rounded-none border-b-2 border-transparent px-0 pb-2 shadow-none data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
                >
                  Job Applications
                </TabsTrigger>
              </TabsList>

              {/* All three tabs share the same chart layout */}
              {(['overview', 'jobViews', 'jobApplications'] as DataTab[]).map(
                (tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="flex flex-col gap-4 lg:flex-row">
                      {/* Chart */}
                      <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[280px] flex-1 min-w-0"
                      >
                        <BarChart data={currentDataSet.data}>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={40}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          {tab === 'overview' && (
                            <ChartLegend content={<ChartLegendContent />} />
                          )}
                          {(tab === 'overview' || tab === 'jobViews') && (
                            <Bar
                              dataKey="jobViews"
                              fill="var(--color-jobViews)"
                              radius={
                                tab === 'overview' ? [0, 0, 0, 0] : [4, 4, 0, 0]
                              }
                              stackId={tab === 'overview' ? 'stack' : undefined}
                            />
                          )}
                          {(tab === 'overview' ||
                            tab === 'jobApplications') && (
                            <Bar
                              dataKey="jobApplications"
                              fill="var(--color-jobApplications)"
                              radius={[4, 4, 0, 0]}
                              stackId={tab === 'overview' ? 'stack' : undefined}
                            />
                          )}
                        </BarChart>
                      </ChartContainer>

                      {/* Summary cards */}
                      <div className="flex flex-row gap-4 lg:w-[220px] lg:flex-col">
                        <SummaryCard
                          title="Job Views"
                          total={currentDataSet.summary.totalJobViews}
                          diff={currentDataSet.summary.jobViewsDiff}
                          periodLabel={timeModeLabel}
                          icon={Eye}
                          iconBg="bg-orange-400"
                        />
                        <SummaryCard
                          title="Job Applications"
                          total={currentDataSet.summary.totalJobApplications}
                          diff={currentDataSet.summary.jobApplicationsDiff}
                          periodLabel={timeModeLabel}
                          icon={FileText}
                          iconBg="bg-purple-500"
                        />
                      </div>
                    </div>
                  </TabsContent>
                )
              )}
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
