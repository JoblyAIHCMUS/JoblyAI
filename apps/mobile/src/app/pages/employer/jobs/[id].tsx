'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Dot, MoreHorizontal } from 'lucide-react-native';

import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import { useEmployerJobDetail } from '../../../../hooks/useEmployerJobDetail';
import { useEmployerJobApplications } from '../../../../hooks/useEmployerJobApplications';
import { EMPLOYMENT_TYPE_LABELS } from './constants';
import { COLORS } from '../../../constants/theme';
import JobDetailsTab from './components/JobDetailsTab';
import ApplicantsTab from './components/ApplicantsTab';
import { ApplicationStatus } from '../../../../types/application';

// ── Types ───────────────────────────────────────────────────────────────
type TabName = 'Applicants' | 'Job Details' | 'Analytics';

const tabs: TabName[] = ['Applicants', 'Job Details', 'Analytics'];

// ── Main Screen ─────────────────────────────────────────────────────────
export default function JobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabName>('Job Details');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const numericId = id ? Number(id) : null;
  const { data: job, isLoading, isError } = useEmployerJobDetail(numericId);

  const {
    data: applicationsData,
    isLoading: isApplicationsLoading,
    fetchNextPage: fetchNextApplicationsPage,
    hasNextPage: hasNextApplicationsPage,
    isFetchingNextPage: isFetchingNextApplicationsPage,
    refetch: refetchApplications,
    isRefetching: isRefetchingApplications,
  } = useEmployerJobApplications(numericId || undefined, debouncedSearch, 10);

  // Map backend ApplicationStatus to frontend ApplicantStatus
  const mapApplicationStatus = (
    status: ApplicationStatus
  ): import('./components/ApplicantsTab').ApplicantStatus => {
    switch (status) {
      case 'APPLIED':
        return 'In-review';
      case 'INTERVIEW':
        return 'Interviewed';
      case 'OFFER':
        return 'Shortlisted';
      case 'REJECTED':
        return 'Declined';
      case 'WITHDRAWN':
        return 'Declined';
      default:
        return 'In-review';
    }
  };

  const mappedApplicants = useMemo(() => {
    if (!applicationsData) return [];

    return applicationsData.pages.flatMap((page) =>
      page.applications.map((app) => {
        // Safe access for candidate mapping since backend types can sometimes be different from real data
        const candidateData = (
          app as unknown as {
            candidate: { name?: string; email?: string; avatarUrl?: string };
          }
        ).candidate;
        const candidateName =
          candidateData?.name || candidateData?.email || `Candidate #${app.id}`;
        const avatarUrl =
          candidateData?.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.id}`;

        return {
          id: String(app.id),
          name: candidateName,
          avatarUrl: avatarUrl,
          rating:
            (app as unknown as { matchPercentage: number }).matchPercentage ||
            0,
          status: mapApplicationStatus(app.status),
        };
      })
    );
  }, [applicationsData]);

  const totalApplications = applicationsData?.pages[0]?.total || 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <EmployerDashboardHeader />

      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          activeOpacity={0.8}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={32} color={COLORS.brandDark} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreHorizontal size={32} color={COLORS.brandDark} />
        </TouchableOpacity>
      </View>

      {/* Title + Category/Type */}
      <View className="px-4 pb-3">
        <Text className="text-2xl font-semibold text-app-slate-1">
          {job?.title ?? 'Loading…'}
        </Text>
        {job && (
          <View className="mt-1 flex-row items-center">
            <Text className="text-xl font-medium text-app-slate-1">
              {job.category?.name ?? '—'}
            </Text>
            <Dot
              size={28}
              color={COLORS.brandDark}
              style={{ marginHorizontal: 4 }}
            />
            <Text className="text-xl font-medium text-app-slate-1">
              {EMPLOYMENT_TYPE_LABELS[job.type] ?? job.type}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View
        className="flex-row justify-between border-b border-app-border-2 px-4"
        pointerEvents="box-none"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return isActive ? (
            <View key={tab} className="border-b-2 border-app-primary-2 pb-2">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab)}
              >
                <Text className="text-app-primary-2 font-semibold text-lg">
                  {tab}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.85}
              onPress={() => setActiveTab(tab)}
              className="pb-2"
            >
              <Text className="text-app-text-3 font-semibold text-lg">
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View className="flex-1 bg-white">
        {activeTab === 'Applicants' ? (
          <ApplicantsTab
            applicants={mappedApplicants}
            total={totalApplications}
            isLoading={isApplicationsLoading}
            hasNextPage={hasNextApplicationsPage}
            isFetchingNextPage={isFetchingNextApplicationsPage}
            fetchNextPage={fetchNextApplicationsPage}
            refetch={refetchApplications}
            isRefetching={
              isRefetchingApplications && !isFetchingNextApplicationsPage
            }
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        ) : activeTab === 'Job Details' ? (
          <JobDetailsTab
            job={job}
            isLoading={isLoading}
            isError={isError}
            jobId={id}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base text-app-text-gray">
              This tab is empty for now.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
