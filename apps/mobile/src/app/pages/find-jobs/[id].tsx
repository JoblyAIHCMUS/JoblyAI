'use client';

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/app/constants/theme';
import { useJobDetail } from '@/hooks/useJobDetail';
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
  } = useJobDetail(jobId);
  const { data: user } = useUser();

  const [hasApplied, setHasApplied] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const { fetchApplications } = useListCandidateApplications();

  useEffect(() => {
    if (!user) return;

    const checkApplication = async () => {
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
        // Silently fail - user may not be authenticated
      }
    };

    checkApplication();
  }, [user, jobId, fetchApplications]);

  const handleApply = () => {
    setApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    setHasApplied(true);
    setApplyModalOpen(false);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (loadingJob) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView
          className="flex-1 bg-white"
          edges={['top', 'left', 'right']}
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

  if (errorJob || !job) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView
          className="flex-1 bg-white"
          edges={['top', 'left', 'right']}
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
        edges={['top', 'left', 'right']}
      >
        <ScrollView className="flex-1">
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
            jobId={job.id}
            companyId={job.company.id}
            location={job.location || undefined}
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
