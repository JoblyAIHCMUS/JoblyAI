'use client';

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Eye, FileText } from 'lucide-react';
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
import type { JobListingDetail } from '@/features/employer/job-listing/detail/data';

const chartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--chart-1))',
  },
  applications: {
    label: 'Applications',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function buildChartData(job: JobListingDetail) {
  const [startYear, startMonth] = job.datePosted.split('-').map(Number) as [
    number,
    number
  ];

  // Count applications per YYYY-MM
  const appsByMonth = new Map<string, number>();
  for (const applicant of job.applicants) {
    const key = applicant.appliedDate.slice(0, 7); // "YYYY-MM"
    appsByMonth.set(key, (appsByMonth.get(key) ?? 0) + 1);
  }

  const data: { month: string; views: number; applications: number }[] = [];

  let year = startYear;
  let month = startMonth;

  for (let i = 0; i < job.monthlyViews.length; i++) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const label = `${MONTH_LABELS[month - 1]} ${year}`;

    data.push({
      month: label,
      views: job.monthlyViews[i],
      applications: appsByMonth.get(key) ?? 0,
    });

    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return data;
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
          <div
            className={cn('rounded-full p-2 flex-shrink-0', iconBg)}
          >
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
  const chartData = useMemo(() => buildChartData(job), [job]);

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
        <CardHeader>
          <CardTitle className="heading-h6-semi-bold">
            Views &amp; Applications Over Time
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly statistics since {job.datePosted}
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[350px] w-full"
          >
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={Math.max(0, Math.ceil(chartData.length / 10) - 1)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="views"
              stroke="var(--color-views)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="var(--color-applications)"
              strokeWidth={2}
              dot={false}
            />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
