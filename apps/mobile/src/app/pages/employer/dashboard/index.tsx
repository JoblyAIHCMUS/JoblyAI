import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { DashboardHeader } from './components/DashboardHeader';
import { SummaryCards } from './components/SummaryCards';
import { JobStatisticsChart } from './components/JobStatisticsChart';
import { DetailedStatCards } from './components/DetailedStatCards';
import EmployerDashboardHeader from './components/EmployerDashboardHeader';
import EmployerDashboardSidebar from './components/EmployerDashboardSidebar';

// Hooks
import { useAuth } from '../../../../hooks/useAuth';
import { useListEmployerApplications } from '../../../../hooks/useListEmployerApplications';
import { useChatSummary } from '../../../../hooks/messaging/useChatSummary';
import { useJobAnalytics } from '../../../../hooks/useJobAnalytics';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';

// Utils
import {
  aggregateAnalyticsData,
  getDateRangeForPeriods,
} from './utils/statsAggregation';

export default function EmployerDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [loadError, setLoadError] = useState<string | null>(null);

  const { isPending: sessionPending, isEmployer } = useAuth();

  const {
    fetchApplications,
    data: applicationsResult,
    loading: applicationsLoading,
  } = useListEmployerApplications();
  const { data: employerProfileForChat } = useGetEmployerProfile();
  const { data: chatsResult, isLoading: chatsLoading } = useChatSummary(
    employerProfileForChat?.id
  );
  const {
    fetchAnalytics,
    viewsData,
    appsData,
    loading: analyticsLoading,
  } = useJobAnalytics();

  const periods = groupBy === 'day' ? 7 : groupBy === 'week' ? 4 : 12;

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [startDate, endDate] = getDateRangeForPeriods(groupBy, periods * 2);

      const promises: Promise<unknown>[] = [
        fetchApplications({ status: 'APPLIED', pageSize: 1 }),
        fetchAnalytics(startDate, endDate, groupBy),
      ];

      await Promise.all(promises);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load dashboard data. Pull to refresh.';
      setLoadError(message);
      // The 401/403 path is handled by the axios interceptor. Anything that
      // bubbles up here is a non-auth error (network, 5xx, etc.) — surface
      // it to the user, but only as a toast, not a hard failure.
      Toast.show({
        type: 'error',
        text1: 'Dashboard error',
        text2: message,
      });
      // eslint-disable-next-line no-console
      console.error('Error loading dashboard data:', error);
    }
  }, [fetchApplications, fetchAnalytics, groupBy, periods]);

  useEffect(() => {
    // Don't fire requests until the session has resolved AND we know the
    // user is an employer. Firing earlier races the role check and produces
    // spurious 403s for candidates who briefly land on this screen.
    if (sessionPending || !isEmployer) {
      return;
    }
    void loadData();
  }, [isEmployer, sessionPending, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const candidateCount = applicationsResult?.total || 0;
  const messageCount =
    chatsResult?.filter((chat) => chat.hasUnread).length || 0;

  const { chartData, summary } = useMemo(() => {
    if (!viewsData && !appsData) {
      return {
        chartData: [],
        summary: {
          totalJobViews: 0,
          totalJobApplications: 0,
          jobViewsDiff: 0,
          jobApplicationsDiff: 0,
          periodLabel: 'This Week',
        },
      };
    }

    return aggregateAnalyticsData(
      viewsData || [],
      appsData || [],
      groupBy,
      periods
    );
  }, [viewsData, appsData, groupBy, periods]);

  const isLoadingSummary = applicationsLoading || chatsLoading;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="pb-10">
          <DashboardHeader />
          {loadError && (
            <View className="mx-4 mt-3 rounded-lg border border-app-red-1 bg-[#fff1f0] px-3 py-2">
              <Text className="text-sm font-medium text-app-red-1">
                {loadError}
              </Text>
            </View>
          )}
          <SummaryCards
            candidateCount={candidateCount}
            messageCount={messageCount}
            loading={isLoadingSummary}
          />
          <View className="h-[1px] bg-app-border-2 mt-8" />
          <JobStatisticsChart
            data={chartData}
            loading={analyticsLoading}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />
          <DetailedStatCards summary={summary} loading={analyticsLoading} />
        </View>
      </ScrollView>
      <EmployerDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
