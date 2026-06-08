'use client';

import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  LucideIcon,
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
  jobViewsDiff: number | null; // null = no comparable baseline
  jobApplicationsDiff: number | null; // null = no comparable baseline
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
  diff: number | null;
  periodLabel: string;
  icon: LucideIcon;
  iconBg: string;
}) {
  const hasDiff = diff !== null;
  const diffValue = hasDiff ? (diff as number) : 0;
  const isPositive = hasDiff && diffValue >= 0;

  return (
    <Card className="flex-1 shadow-none">
      <CardContent className="flex flex-col gap-1 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="label-label-2-medium text-muted-foreground text-xs sm:text-sm">
            {title}
          </span>
          <div
            className={cn('rounded-full p-1 sm:p-1.5 flex-shrink-0', iconBg)}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
        </div>
        <span className="text-2xl sm:text-3xl heading-h2-bold">
          {total.toLocaleString()}
        </span>
        <div className="flex items-center gap-0.5 sm:gap-1 text-xs">
          <span className="text-muted-foreground truncate">{periodLabel}</span>
          {hasDiff ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium flex-shrink-0',
                isPositive ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              )}
              {Math.abs(diffValue).toFixed(1)}%
            </span>
          ) : (
            <span className="inline-flex items-center font-medium flex-shrink-0 text-slate-400">
              —
            </span>
          )}
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
      <CardHeader className="flex flex-col gap-3 sm:gap-4 space-y-0 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base sm:text-lg md:text-xl heading-h6-semi-bold">
            Job statistics
          </CardTitle>
          {error ? (
            <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Showing job statistics for {currentDataSet.periodLabel}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border px-2.5 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
                isRefreshing || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50'
              )}
            >
              <RefreshCw
                className={cn(
                  'h-3.5 w-3.5 sm:h-4 sm:w-4',
                  isRefreshing && 'animate-spin'
                )}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          {/* Time mode selector */}
          <div className="inline-flex rounded-lg border p-0.5 sm:p-1">
            {(['week', 'month', 'year'] as TimeMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeMode(mode)}
                disabled={isLoading}
                className={cn(
                  'rounded-md px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-medium capitalize transition-colors',
                  timeMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-muted-foreground hover:text-foreground',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[240px] sm:h-[280px] text-muted-foreground text-xs sm:text-base">
            Loading statistics...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[240px] sm:h-[280px] rounded-lg border border-red-200 bg-red-50">
            <div className="text-center px-4">
              <p className="text-red-800 font-medium text-xs sm:text-base">
                {error}
              </p>
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="mt-2 inline-flex items-center gap-2 text-xs sm:text-sm text-red-600 hover:text-red-700 underline"
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
              <TabsList className="bg-transparent p-0 h-auto gap-2 sm:gap-4 border-b rounded-none w-full justify-start overflow-x-auto">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-0 sm:px-2 pb-2 shadow-none text-xs sm:text-sm whitespace-nowrap data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="jobViews"
                  className="rounded-none border-b-2 border-transparent px-0 sm:px-2 pb-2 shadow-none text-xs sm:text-sm whitespace-nowrap data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
                >
                  <span className="hidden sm:inline">Job Views</span>
                  <span className="sm:hidden">Views</span>
                </TabsTrigger>
                <TabsTrigger
                  value="jobApplications"
                  className="rounded-none border-b-2 border-transparent px-0 sm:px-2 pb-2 shadow-none text-xs sm:text-sm whitespace-nowrap data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
                >
                  <span className="hidden sm:inline">Job Applications</span>
                  <span className="sm:hidden">Apps</span>
                </TabsTrigger>
              </TabsList>

              {/* All three tabs share the same chart layout */}
              {(['overview', 'jobViews', 'jobApplications'] as DataTab[]).map(
                (tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row">
                      {/* Chart */}
                      <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[200px] sm:h-[240px] lg:h-[280px] flex-1 min-w-0 overflow-x-auto"
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
                      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row lg:w-full lg:flex-col lg:max-w-[220px]">
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
