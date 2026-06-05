'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { DashboardBigButton } from '@/components/employer/dashboardBigButton';
import {
  DashboardStatsPanel,
  type StatsDataSet,
} from '@/components/employer/dashboardStatsPanel';
import { useListEmployerApplications } from '@/api-hook/application';
import { useGetChatSummary } from '@/api-hook/messages';
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
  const [messageCount, setMessageCount] = useState(0);
  const [weekData, setWeekData] = useState<StatsDataSet | null>(null);
  const [monthData, setMonthData] = useState<StatsDataSet | null>(null);
  const [yearData, setYearData] = useState<StatsDataSet | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorCounts, setErrorCounts] = useState<string | null>(null);

  // Hooks for data fetching
  const { fetchApplications } = useListEmployerApplications({
    initialPageSize: 10,
  });
  const { fetchChatSummary } = useGetChatSummary();
  const { fetchAnalytics: fetchViewsAnalytics } = useJobViewsAnalytics();
  const { fetchAnalytics: fetchAppsAnalytics } = useJobApplicationsAnalytics();

  // Polling intervals ref
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fetch counts: applications and messages
   */
  const fetchCounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      setErrorCounts(null);

      // Fetch pending applications (status = APPLIED)
      const appsResult = await fetchApplications({
        status: 'APPLIED',
        pageSize: 1,
      });
      setCandidateCount(appsResult.total || 0);

      // Fetch chat summary to count unread messages
      const chatsResult = await fetchChatSummary(user.id);
      const unreadCount =
        chatsResult?.filter((chat) => chat.hasUnread).length || 0;
      setMessageCount(unreadCount);
    } catch (err) {
      console.error('Failed to fetch counts:', err);
      setErrorCounts('Failed to load counts');
    } finally {
      setLoadingCounts(false);
    }
  }, [user?.id, fetchApplications, fetchChatSummary]);

  /**
   * Fetch and aggregate analytics data for all three time modes in parallel
   */
  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) return;

    setLoadingStats(true);
    setErrorStats(null);

    try {
      // Day-level data: past 7 days (for "Week" time mode)
      const [dayStart, dayEnd] = getDateRangeForPeriods('day', 7);
      // Week-level data: past 4 weeks (for "Month" time mode)
      const [weekStart, weekEnd] = getDateRangeForPeriods('week', 4);
      // Month-level data: past 12 months (for "Year" time mode)
      const [monthStart, monthEnd] = getDateRangeForPeriods('month', 12);

      const [
        dayViews,
        dayApps,
        weekViews,
        weekApps,
        monthViews,
        monthApps,
      ] = await Promise.all([
        fetchViewsAnalytics(dayStart, dayEnd, 'day'),
        fetchAppsAnalytics(dayStart, dayEnd, 'day'),
        fetchViewsAnalytics(weekStart, weekEnd, 'week'),
        fetchAppsAnalytics(weekStart, weekEnd, 'week'),
        fetchViewsAnalytics(monthStart, monthEnd, 'month'),
        fetchAppsAnalytics(monthStart, monthEnd, 'month'),
      ]);

      setWeekData(
        aggregateAnalyticsData(dayViews || [], dayApps || [], 'day')
      );
      setMonthData(
        aggregateAnalyticsData(weekViews || [], weekApps || [], 'week')
      );
      setYearData(
        aggregateAnalyticsData(monthViews || [], monthApps || [], 'month')
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

    // Initial fetch for all data
    fetchCounts();
    fetchAnalyticsData();

    // Set up polling for counts (every 30 seconds)
    pollIntervalRef.current = setInterval(() => {
      fetchCounts();
    }, 30 * 1000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [user?.id, fetchCounts, fetchAnalyticsData]);

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
