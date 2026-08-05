'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/app/constants/theme';
import { useJobDetail } from '@/hooks/useJobDetail';
import { useSimilarJobs } from '@/hooks/useSimilarJobs';
import { useListCandidateApplications } from '@/hooks/useListCandidateApplications';
import JobDetailHeader from './components/JobDetailHeader';
import JobDetailContent from './components/JobDetailContent';
import JobCompanySection from './components/JobCompanySection';
import SimilarJobs from './components/SimilarJobs';
import ApplyJobModal from './components/ApplyJobModal';
import { useUser } from '@/hooks/useUser';
import * as Haptics from 'expo-haptics';

export default function JobDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = Number(id);

  const {
    data: job,
    loading: loadingJob,
    error: errorJob,
    refresh: refreshJob,
  } = useJobDetail(jobId);
  const { data: user } = useUser();

  const {
    data: similarJobs,
    loading: loadingSimilarJobs,
    error: errorSimilarJobs,
    refresh: refreshSimilarJobs,
  } = useSimilarJobs({
    jobId: job?.id,
    companyId: job?.company?.id,
    location: job?.location || undefined,
    limit: 6,
  });

  const [hasApplied, setHasApplied] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const { fetchApplications } = useListCandidateApplications();

  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const refreshAppliedStatus = useCallback(async (): Promise<boolean> => {
    if (!user) return true;

    try {
      const result = await fetchApplications({ page: 1, pageSize: 100 });
      if (result?.applications) {
        const applied = result.applications.some(
          (app) =>
            app.jobId === jobId &&
            [
              'APPLIED',
              'PRE_SHORTLIST_PENDING',
              'PRE_SHORTLIST_SUBMITTED',
              'INTERVIEW',
              'OFFER',
            ].includes(app.status)
        );
        setHasApplied(applied);
      }
    } catch {
      // Application status is optional for unauthenticated users.
    }

    return true;
  }, [fetchApplications, jobId, user]);

  useEffect(() => {
    void refreshAppliedStatus();
  }, [refreshAppliedStatus]);

  const handleRefresh = useCallback(async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const results = await Promise.allSettled([
        refreshJob(),
        refreshSimilarJobs(),
        refreshAppliedStatus(),
      ]);
      const failed = results.some(
        (result) =>
          result.status === 'rejected' ||
          (result.status === 'fulfilled' && result.value === false)
      );

      if (failed) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [refreshAppliedStatus, refreshJob, refreshSimilarJobs]);

  const handleApply = () => {
    setApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    setHasApplied(true);
    setApplyModalOpen(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (loadingJob && !job) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView
          className="flex-1 bg-white"
          edges={['top', 'left', 'right', 'bottom']}
        >
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary2} />
            <Text className="mt-4 text-sm text-app-gray-3">
              Loading job details...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView
          className="flex-1 bg-white"
          edges={['top', 'left', 'right', 'bottom']}
        >
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-center text-lg text-app-dark-text">
              {errorJob?.message || 'Job not found'}
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        className="flex-1 bg-white"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary2]}
              tintColor={COLORS.primary2}
            />
          }
        >
          {/* Header */}
          <JobDetailHeader
            job={job}
            hasApplied={hasApplied}
            onApply={handleApply}
          />

          {/* Content */}
          <JobDetailContent job={job} />

          {/* Company Section */}
          <JobCompanySection company={job.company} />

          {/* Similar Jobs */}
          <SimilarJobs
            jobs={similarJobs}
            loading={loadingSimilarJobs}
            error={errorSimilarJobs}
            onRetry={() => void refreshSimilarJobs()}
          />
        </ScrollView>
      </SafeAreaView>

      <ApplyJobModal
        visible={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        job={job}
        onSuccess={handleApplySuccess}
      />
    </>
  );
}
