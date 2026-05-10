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
  const [statsData, setStatsData] = useState<StatsDataSet | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorCounts, setErrorCounts] = useState<string | null>(null);

  // Hooks for data fetching
  const { fetchApplications } = useListEmployerApplications();
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
   * Fetch and aggregate analytics data
   */
  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) return;

    setLoadingStats(true);
    setErrorStats(null);

    try {
      // Get date range for last 7 days
      const [startDate, endDate] = getDateRangeForPeriods('day', 7);

      // Fetch both views and applications analytics
      const [viewsData, appsData] = await Promise.all([
        fetchViewsAnalytics(startDate, endDate, 'day'),
        fetchAppsAnalytics(startDate, endDate, 'day'),
      ]);

      // Aggregate into StatsDataSet format
      const aggregated = aggregateAnalyticsData(
        viewsData || [],
        appsData || [],
        'day'
      );
      setStatsData(aggregated);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="heading-h4-semi-bold mb-6">
        {greeting}
        {firstName ? `, ${firstName}` : ', user'}
      </h1>

      {/* Top cards with counts */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
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
      {statsData ? (
        <DashboardStatsPanel
          weekData={statsData}
          monthData={statsData}
          yearData={statsData}
          className="mt-6"
          isLoading={loadingStats}
          onRefresh={fetchAnalyticsData}
          error={errorStats || undefined}
        />
      ) : loadingStats ? (
        <div className="mt-6 p-8 bg-gray-50 rounded-lg text-center text-gray-500">
          Loading statistics...
        </div>
      ) : null}
    </div>
  );
}
