'use client';

import { useState, useMemo } from 'react';
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
import type { JobListingDetail } from '@/features/employer/job-listing/detail/data';

const chartConfig = {
  views: {
    label: 'Views',
    color: '#14b8a6',
  },
} satisfies ChartConfig;

function generateMockViewsData(mode: 'week' | 'month' | 'year') {
  const data: { label: string; views: number }[] = [];

  if (mode === 'week') {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      data.push({
        label: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        views: Math.floor(Math.random() * (600 - 100 + 1)) + 100,
      });
    }
  } else if (mode === 'month') {
    const start = new Date();
    start.setDate(start.getDate() - 29);
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      data.push({
        label: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        views: Math.floor(Math.random() * (1000 - 200 + 1)) + 200,
      });
    }
  } else if (mode === 'year') {
    const start = new Date();
    start.setMonth(start.getMonth() - 11);
    for (let i = 0; i < 12; i++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + i);
      data.push({
        label: d.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        views: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,
      });
    }
  }

  return data;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
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

export default function JobStatsPanel({ job }: { job: JobListingDetail }) {
  const [timeMode, setTimeMode] = useState<'week' | 'month' | 'year'>('week');
  const chartData = useMemo(() => generateMockViewsData(timeMode), [timeMode]);

  const totalApplications = job.applicants.length;
  const totalViews = job.monthlyViews.reduce((sum, views) => sum + views, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top summary cards */}
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

      {/* Chart card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <CardTitle className="text-xl font-bold">
            Job Listing View stats
          </CardTitle>
          <div className="w-[180px]">
            <Select
              value={timeMode}
              onValueChange={(val: 'week' | 'month' | 'year') =>
                setTimeMode(val)
              }
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
        </CardContent>
      </Card>
    </div>
  );
}
