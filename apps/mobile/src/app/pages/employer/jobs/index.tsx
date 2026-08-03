import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';

import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import { JobsHeader } from './components/JobsHeader';
import { JobCard } from './components/JobCard';
import DateFilterModal from '../../candidate/dashboard/components/DateFilterModal';
import type { DatePreset } from '../../candidate/dashboard/types';

import { useEmployerJobsQuery } from '../../../../hooks/useEmployerJobs';
import { mapJobPostingToListing, JobListing } from './data';
import { COLORS } from '../../../constants/theme';

function getDefaultWeekRange() {
  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  const last7 = new Date(now);
  last7.setDate(last7.getDate() - 6);
  const start = new Date(
    last7.getFullYear(),
    last7.getMonth(),
    last7.getDate()
  );
  const label = `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${endOfDay.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
  return { start, end: endOfDay, label };
}

export default function EmployerJobListingScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [selectedDatePreset, setSelectedDatePreset] =
    useState<DatePreset | null>(null);
  const defaultWeekRange = useMemo(() => getDefaultWeekRange(), []);
  const [selectedDateRange, setSelectedDateRange] = useState(defaultWeekRange);
  const [selectedDateLabel, setSelectedDateLabel] = useState(
    defaultWeekRange.label
  );

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useEmployerJobsQuery();

  const jobsList: JobListing[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.jobs.map(mapJobPostingToListing));
  }, [data]);

  const filteredJobsList = useMemo(
    () =>
      jobsList.filter(
        (job) =>
          job.createdAt >= selectedDateRange.start &&
          job.createdAt <= selectedDateRange.end
      ),
    [jobsList, selectedDateRange.end, selectedDateRange.start]
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="items-center py-10">
        <Text className="text-base text-app-text-3">
          {isError ? 'Failed to load jobs.' : 'No jobs found.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-app-neutral-1" edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />

      <FlatList
        data={filteredJobsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View className="-mx-4">
              <JobsHeader
                dateLabel={selectedDateLabel}
                onDatePress={() => setIsDateFilterOpen(true)}
              />
            </View>
            <View className="h-[1px] bg-app-border-2 mb-4 -mx-4" />
            <Text className="text-2xl font-bold text-app-slate-1 mb-4">
              All jobs : {isLoading ? '...' : filteredJobsList.length}
            </Text>
          </>
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              try {
                await refetch();
              } catch {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error
                );
              }
            }}
            colors={[COLORS.primary]}
          />
        }
      />

      <DateFilterModal
        isOpen={isDateFilterOpen}
        onClose={() => setIsDateFilterOpen(false)}
        currentPreset={selectedDatePreset}
        onApply={(preset, start, end, label) => {
          setSelectedDatePreset(preset);
          setSelectedDateRange({ start, end });
          setSelectedDateLabel(label);
        }}
      />

      <EmployerDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
