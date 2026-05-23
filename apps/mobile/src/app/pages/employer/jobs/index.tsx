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

// Components
import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import { JobsHeader } from './components/JobsHeader';
import { JobCard } from './components/JobCard';

// Hooks & Data
import { useEmployerJobsQuery } from '../../../../hooks/useEmployerJobs';
import { mapJobPostingToListing, JobListing } from './data';

export default function EmployerJobListingScreen() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const totalJobs = data?.pages[0]?.total || 0;

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#4640DE" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null; // Wait for initial load
    return (
      <View className="items-center py-10">
        <Text className="text-base text-[#475569]">
          {isError ? 'Failed to load jobs.' : 'No jobs found.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAFA]" edges={['left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />

      <FlatList
        data={jobsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View className="-mx-4">
              <JobsHeader />
            </View>
            <View className="h-[1px] bg-[#CBD5E1] mb-4 -mx-4" />
            <Text className="text-2xl font-bold text-[#0F172A] mb-4">
              All jobs : {isLoading ? '...' : totalJobs}
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
            onRefresh={refetch}
            colors={['#4640DE']}
          />
        }
      />

      <EmployerDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
