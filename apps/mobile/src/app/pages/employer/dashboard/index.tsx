import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { DashboardHeader } from './components/DashboardHeader';
import { SummaryCards } from './components/SummaryCards';
import { JobStatisticsChart } from './components/JobStatisticsChart';
import { DetailedStatCards } from './components/DetailedStatCards';
import { ApplicantsSummary } from './components/ApplicantsSummary';
import { JobUpdatesList } from './components/JobUpdatesList';
import EmployerDashboardHeader from './components/EmployerDashboardHeader';

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
  const { fetchEmployerProfile } = useGetEmployerProfile();

  const loadData = useCallback(async () => {
    try {
      const [startDate, endDate] = getDateRangeForPeriods('day', 7);

      // Fetch profile first to get the user ID for chat summary
      const employerProfile = await fetchEmployerProfile();

      const promises: Promise<unknown>[] = [
        fetchApplications({ status: 'APPLIED', pageSize: 1 }),
        fetchAnalytics(startDate, endDate, 'day'),
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

  const chartData = useMemo(() => {
    if (!viewsData && !appsData) return [];
    return aggregateAnalyticsData(viewsData || [], appsData || [], 'day');
  }, [viewsData, appsData]);

  const isLoadingSummary = applicationsLoading || chatsLoading;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader />
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
          <View className="h-[1px] bg-[#CBD5E1] mt-8" />
          <JobStatisticsChart data={chartData} loading={analyticsLoading} />
          <DetailedStatCards />
          <View className="h-[1px] bg-[#CBD5E1] mt-8 mb-2" />
          <ApplicantsSummary />
          <View className="h-[1px] bg-[#CBD5E1] mt-2 mb-2" />
          <JobUpdatesList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
