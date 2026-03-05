'use client';

import { useMemo } from 'react';
import { useUser } from '@/hooks/useUser';
import { DashboardBigButton } from '@/components/employer/dashboardBigButton';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function EmployerDashboardPage() {
  const { data: user } = useUser();
  const greeting = useMemo(() => getGreeting(), []);
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {greeting}
        {firstName ? `, ${firstName}` : ', Maria'}
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <DashboardBigButton
          count={76}
          label="New candidates to review"
          href="/employer/all-applicants"
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
    </div>
  );
}
