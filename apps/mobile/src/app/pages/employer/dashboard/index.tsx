import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { DashboardHeader } from './components/DashboardHeader';
import { SummaryCards } from './components/SummaryCards';
import { JobStatisticsChart } from './components/JobStatisticsChart';
import { DetailedStatCards } from './components/DetailedStatCards';
import EmployerDashboardHeader from './components/EmployerDashboardHeader';
import EmployerDashboardSidebar from './components/EmployerDashboardSidebar';

// Hooks
import { useListEmployerApplications } from '../../../../hooks/useListEmployerApplications';
import { useGetChatSummary } from '../../../../hooks/useGetChatSummary';
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

  const {
    fetchApplications,
    data: applicationsResult,
    loading: applicationsLoading,
  } = useListEmployerApplications();
  const {
    fetchChatSummary,
    data: chatsResult,
    loading: chatsLoading,
  } = useGetChatSummary();
  const {
    fetchAnalytics,
    viewsData,
    appsData,
    loading: analyticsLoading,
  } = useJobAnalytics();
  const { refetch: fetchEmployerProfile } = useGetEmployerProfile();

  const periods = groupBy === 'day' ? 7 : groupBy === 'week' ? 4 : 12;

  const loadData = useCallback(async () => {
    try {
      const [startDate, endDate] = getDateRangeForPeriods(groupBy, periods * 2);

      // Fetch profile first to get the user ID for chat summary
      const { data: employerProfile } = await fetchEmployerProfile();

      const promises: Promise<unknown>[] = [
        fetchApplications({ status: 'APPLIED', pageSize: 1 }),
        fetchAnalytics(startDate, endDate, groupBy),
      ];

      if (employerProfile?.id) {
        promises.push(fetchChatSummary(employerProfile.id));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [
    fetchApplications,
    fetchChatSummary,
    fetchAnalytics,
    fetchEmployerProfile,
    groupBy,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  }, [viewsData, appsData, groupBy]);

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
