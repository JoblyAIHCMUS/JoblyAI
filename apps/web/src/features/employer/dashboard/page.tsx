'use client';

import { useUser } from '@/hooks/useUser';
import { DashboardBigButton } from '@/components/employer/dashboardBigButton';
import {
  DashboardStatsPanel,
  type StatsDataSet,
} from '@/components/employer/dashboardStatsPanel';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const weekData: StatsDataSet = {
  periodLabel: 'Jul 19-25',
  data: [
    { label: 'Mon', jobViews: 420, jobApplications: 120 },
    { label: 'Tue', jobViews: 350, jobApplications: 90 },
    { label: 'Wed', jobViews: 480, jobApplications: 130 },
    { label: 'Thu', jobViews: 390, jobApplications: 110 },
    { label: 'Fri', jobViews: 310, jobApplications: 95 },
    { label: 'Sat', jobViews: 220, jobApplications: 60 },
    { label: 'Sun', jobViews: 172, jobApplications: 49 },
  ],
  summary: {
    totalJobViews: 2342,
    totalJobApplications: 654,
    jobViewsDiff: 6.4,
    jobApplicationsDiff: -0.5,
  },
};

const monthData: StatsDataSet = {
  periodLabel: 'Jul 2026',
  data: [
    { label: 'W1', jobViews: 1800, jobApplications: 520 },
    { label: 'W2', jobViews: 2100, jobApplications: 610 },
    { label: 'W3', jobViews: 2342, jobApplications: 654 },
    { label: 'W4', jobViews: 1950, jobApplications: 580 },
  ],
  summary: {
    totalJobViews: 8192,
    totalJobApplications: 2364,
    jobViewsDiff: 12.3,
    jobApplicationsDiff: 4.7,
  },
};

const yearData: StatsDataSet = {
  periodLabel: '2026',
  data: [
    { label: 'Jan', jobViews: 6200, jobApplications: 1800 },
    { label: 'Feb', jobViews: 5800, jobApplications: 1650 },
    { label: 'Mar', jobViews: 7100, jobApplications: 2100 },
    { label: 'Apr', jobViews: 6800, jobApplications: 1950 },
    { label: 'May', jobViews: 7500, jobApplications: 2200 },
    { label: 'Jun', jobViews: 8100, jobApplications: 2400 },
    { label: 'Jul', jobViews: 8192, jobApplications: 2364 },
    { label: 'Aug', jobViews: 7900, jobApplications: 2300 },
    { label: 'Sep', jobViews: 7200, jobApplications: 2000 },
    { label: 'Oct', jobViews: 6800, jobApplications: 1900 },
    { label: 'Nov', jobViews: 6400, jobApplications: 1700 },
    { label: 'Dec', jobViews: 6000, jobApplications: 1600 },
  ],
  summary: {
    totalJobViews: 49692,
    totalJobApplications: 14464,
    jobViewsDiff: 18.2,
    jobApplicationsDiff: 9.1,
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EmployerDashboardPage() {
  const { data: user } = useUser();
  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {greeting}
        {firstName ? `, ${firstName}` : ', user'}
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <DashboardBigButton
          count={76}
          label="New candidates to review"
          href="/employer/all-applications"
          bgColor="bg-indigo-600"
          hoverBgColor="hover:bg-indigo-700"
        />

        <DashboardBigButton
          count={24}
          label="Messages received"
          href="/employer/messages"
          bgColor="bg-sky-500"
          hoverBgColor="hover:bg-sky-600"
        />
      </div>

      <DashboardStatsPanel
        weekData={weekData}
        monthData={monthData}
        yearData={yearData}
        className="mt-6"
      />
    </div>
  );
}
