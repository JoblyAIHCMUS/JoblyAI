'use client';

import { useState, useEffect, useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useJobViewsAnalyticsForJob } from '@/api-hook/jobs/useJobViewsAnalyticsForJob';
import type { JobListingDetail } from '@/features/employer/job-listing/detail/data';

type TimeMode = 'week' | 'month' | 'year';

const chartConfig = {
  views: {
    label: 'Views',
    color: '#14b8a6',
  },
} satisfies ChartConfig;

function getRange(mode: TimeMode): {
  start: Date;
  end: Date;
  groupBy: 'day' | 'month';
} {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  if (mode === 'week') {
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end, groupBy: 'day' };
  }
  if (mode === 'month') {
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end, groupBy: 'day' };
  }
  const start = new Date(end.getFullYear(), end.getMonth() - 11, 1, 0, 0, 0, 0);
  return { start, end, groupBy: 'month' };
}

function buildChartData(
  series: Array<{ period: string; viewCount: number }>,
  mode: TimeMode
): Array<{ label: string; views: number }> {
  const { start, end, groupBy } = getRange(mode);
  const byPeriod = new Map(series.map((s) => [s.period, s.viewCount]));
  const out: Array<{ label: string; views: number }> = [];

  if (groupBy === 'day') {
    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
      const key = cursor.toISOString().split('T')[0];
      out.push({
        label: `${cursor.getDate()} ${cursor.toLocaleString('default', {
          month: 'short',
        })}`,
        views: byPeriod.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor.getTime() <= last.getTime()) {
      const key = cursor.toISOString().substring(0, 7);
      out.push({
        label: cursor.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        views: byPeriod.get(key) ?? 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return out;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#475569] text-white px-4 py-3 rounded-md shadow-lg relative translate-y-4">
        <div className="flex items-center gap-2 mb-1 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span>Views</span>
        </div>
        <div className="text-xl font-bold">{payload[0].value}</div>
      </div>
    );
  }
  return null;
}

function SummaryCard({
  title,
  total,
  icon: Icon,
  iconBg,
}: {
  title: string;
  total: number;
  icon: React.ElementType;
  iconBg: string;
}) {
  return (
    <Card className="shadow-sm border">
      <CardContent className="flex flex-col gap-1 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="label-label-2-medium text-muted-foreground text-sm sm:text-base font-semibold">
            {title}
          </span>
          <div className={cn('rounded-full p-2 flex-shrink-0', iconBg)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <span className="text-3xl sm:text-4xl heading-h2-bold mt-2">
          {total.toLocaleString()}
        </span>
      </CardContent>
    </Card>
  );
}

export default function JobStatsPanel({
  jobId,
  job,
}: {
  jobId: number;
  job: JobListingDetail;
}) {
  const [timeMode, setTimeMode] = useState<TimeMode>('week');
  const { fetchAnalytics, loading, error, data } = useJobViewsAnalyticsForJob();

  useEffect(() => {
    const { start, end, groupBy } = getRange(timeMode);
    fetchAnalytics(jobId, start, end, groupBy).catch(() => {
      // Error is captured in hook state via `error`; nothing to do here.
      // On rapid period switches the last-resolved response wins, which
      // matches the existing convention in sibling hooks (see
      // useEmployerJobDetail.ts).
    });
  }, [jobId, timeMode, fetchAnalytics]);

  const chartData = useMemo(
    () => (data ? buildChartData(data.series, timeMode) : []),
    [data, timeMode]
  );

  const totalApplications = job.applicants.length;
  const totalViews = data?.totalViews ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <SummaryCard
          title="Total Views"
          total={totalViews}
          icon={Eye}
          iconBg="bg-orange-400"
        />
        <SummaryCard
          title="Total Applied"
          total={totalApplications}
          icon={FileText}
          iconBg="bg-purple-500"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <CardTitle className="text-xl font-bold">
            Job Listing View stats
          </CardTitle>
          <div className="w-[180px]">
            <Select
              value={timeMode}
              onValueChange={(val: TimeMode) => setTimeMode(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <Skeleton className="h-[350px] w-full" />}
          {!loading && error != null && (
            <div className="h-[350px] w-full flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                Couldn't load view stats.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const { start, end, groupBy } = getRange(timeMode);
                  void fetchAnalytics(jobId, start, end, groupBy);
                }}
              >
                Retry
              </Button>
            </div>
          )}
          {!loading && error == null && data && (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[350px] w-full"
            >
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="6 6"
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={16}
                  tick={{ fill: '#475569', fontSize: 14, fontWeight: 500 }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={16}
                  tick={{ fill: '#475569', fontSize: 14, fontWeight: 500 }}
                  width={60}
                  domain={[0, 'auto']}
                />
                <ChartTooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: '#cbd5e1',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />
                <Line
                  type="natural"
                  dataKey="views"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: '#14b8a6',
                    stroke: 'white',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
