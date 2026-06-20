'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { DashboardBigButton } from '@/components/employer/dashboardBigButton';
import {
  DashboardStatsPanel,
  type StatsDataSet,
} from '@/components/employer/dashboardStatsPanel';
import { useListEmployerApplications } from '@/api-hook/application';
import { getChatSummary } from '@/api-client/messages/public';
import {
  useJobViewsAnalytics,
  useJobApplicationsAnalytics,
} from '@/api-hook/jobs';
import {
  aggregateAnalyticsData,
  getDateRangeForPeriods,
} from '@/features/employer/dashboard/utils/statsAggregation';
import { useGetEmployerProfile } from '@/api-hook/employer';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function EmployerDashboardPage() {
  const { data: user } = useUser();
  const { data: employerProfile } = useGetEmployerProfile();
  const greeting = getGreeting();
  const firstName = employerProfile?.fullName?.split(' ')[0] ?? '';

  // State for dynamic data
  const [candidateCount, setCandidateCount] = useState(0);
  const [weekData, setWeekData] = useState<StatsDataSet | null>(null);
  const [monthData, setMonthData] = useState<StatsDataSet | null>(null);
  const [yearData, setYearData] = useState<StatsDataSet | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Hooks for data fetching
  const {
    data,
    isLoading: isApplicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useListEmployerApplications({
    pageSize: 10,
    status: 'APPLIED',
  });
  // Read from the same React Query cache the messages pages use. The messages
  // sidebar dot and the messages page are all driven by ['chat-summary', userId],
  // so any new message (delivered via the cache bus in SocketProvider) updates
  // the dashboard's unread count instantly without a re-fetch.
  const { data: summaries } = useQuery({
    queryKey: ['chat-summary', user?.id],
    queryFn: () => getChatSummary(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
  const messageCount = summaries?.filter((c) => c.hasUnread).length ?? 0;
  const { fetchAnalytics: fetchViewsAnalytics } = useJobViewsAnalytics();
  const { fetchAnalytics: fetchAppsAnalytics } = useJobApplicationsAnalytics();

  // Derived: candidate count comes from the first page of the applications
  // query (the query only needs the `total` field, so we discard the rest).
  const candidateCount = data?.pages[0]?.total ?? 0;
  // Preserve the original "shared loading/error" semantics: both cards in the
  // UI read from the same loading/error state, which used to be driven by
  // the applications fetch. Keep that pattern verbatim.
  const loadingCounts = isApplicationsLoading;
  const errorCounts = applicationsError ? 'Failed to load counts' : null;

  // Polling intervals ref
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fetch the candidates-to-review count. Message count is now derived from
   * the React Query cache above (shared with the messages pages) and is
   * auto-polled by refetchInterval.
   */
  const fetchCounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      setErrorCounts(null);
      const appsResult = await fetchApplications({
        status: 'APPLIED',
        pageSize: 1,
      });
      setCandidateCount(appsResult.total || 0);
    } catch (err) {
      console.error('Failed to fetch counts:', err);
      setErrorCounts('Failed to load counts');
    } finally {
      setLoadingCounts(false);
    }
  }, [user?.id, fetchApplications]);

  /**
   * Fetch and aggregate analytics data for all three time modes in parallel
   */
  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) return;

    setLoadingStats(true);
    setErrorStats(null);

    try {
      // Day-level data: past 14 days (7 charted + 7 baseline) for "Week" mode
      const [dayStart, dayEnd] = getDateRangeForPeriods('day', 14);
      // Week-level data: past 8 weeks (4 charted + 4 baseline) for "Month" mode
      const [weekStart, weekEnd] = getDateRangeForPeriods('week', 8);
      // Month-level data: past 24 months (12 charted + 12 baseline) for "Year" mode
      const [monthStart, monthEnd] = getDateRangeForPeriods('month', 24);

      const [dayViews, dayApps, weekViews, weekApps, monthViews, monthApps] =
        await Promise.all([
          fetchViewsAnalytics(dayStart, dayEnd, 'day'),
          fetchAppsAnalytics(dayStart, dayEnd, 'day'),
          fetchViewsAnalytics(weekStart, weekEnd, 'week'),
          fetchAppsAnalytics(weekStart, weekEnd, 'week'),
          fetchViewsAnalytics(monthStart, monthEnd, 'month'),
          fetchAppsAnalytics(monthStart, monthEnd, 'month'),
        ]);

      setWeekData(
        aggregateAnalyticsData(dayViews || [], dayApps || [], 'day', 7)
      );
      setMonthData(
        aggregateAnalyticsData(weekViews || [], weekApps || [], 'week', 4)
      );
      setYearData(
        aggregateAnalyticsData(monthViews || [], monthApps || [], 'month', 12)
      );
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setErrorStats('Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  }, [user?.id, fetchViewsAnalytics, fetchAppsAnalytics]);

  /**
   * Initialize data on mount
   */
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch for analytics (the applications count is fetched
    // automatically by useListEmployerApplications; the message count is
    // auto-polled by refetchInterval above).
    fetchAnalyticsData();

    // Poll the candidate count every 30s (the message count is auto-polled
    // by the React Query refetchInterval above).
    pollIntervalRef.current = setInterval(() => {
      refetchApplications();
    }, 30 * 1000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user?.id, fetchAnalyticsData, refetchApplications]);

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl heading-h4-semi-bold mb-4 sm:mb-6">
        {greeting}
        {firstName ? `, ${firstName}` : ', user'}
      </h1>

      {/* Top cards with counts */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <DashboardBigButton
          count={candidateCount}
          label="New candidates to review"
          href="/employer/all-applications"
          bgColor="bg-indigo-600"
          hoverBgColor="hover:bg-indigo-700"
          isLoading={loadingCounts}
          error={errorCounts ? 'Failed to load' : undefined}
        />

        <DashboardBigButton
          count={messageCount}
          label="Messages received"
          href="/employer/messages"
          bgColor="bg-sky-500"
          hoverBgColor="hover:bg-sky-600"
          isLoading={loadingCounts}
          error={errorCounts ? 'Failed to load' : undefined}
        />
      </div>

      {/* Stats Panel */}
      {weekData && monthData && yearData ? (
        <DashboardStatsPanel
          weekData={weekData}
          monthData={monthData}
          yearData={yearData}
          className="mt-4 sm:mt-6 md:mt-8"
          isLoading={loadingStats}
          onRefresh={fetchAnalyticsData}
          error={errorStats || undefined}
        />
      ) : loadingStats ? (
        <div className="mt-4 sm:mt-6 md:mt-8 p-6 sm:p-8 bg-gray-50 rounded-lg text-center text-gray-500 text-sm sm:text-base">
          Loading statistics...
        </div>
      ) : null}
    </div>
  );
}
