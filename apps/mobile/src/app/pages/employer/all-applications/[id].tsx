import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';

import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import { COLORS } from '../../../constants/theme';
import { listEmployerApplications } from '../../../../api/application';
import { PaginatedApplicationsResponse } from '../../../../types/application';
import { ApplicantDetail } from './data';
import { HiringStage } from './types';
import { ApplicantOverview } from './detail/components/ApplicantOverview';
import { ApplicantDetails } from './detail/components/ApplicantDetails';

type RawApplication = PaginatedApplicationsResponse['applications'][number] & {
  jobId?: number | string;
  candidateId?: string;
  candidate?: { name?: string | null; email?: string; phone?: string };
  job?: {
    title?: string;
    type?: string;
    category?: ApplicantDetail['jobCategory'];
  };
  resume?: { fileKey?: string };
  matchPercentage?: number | null;
};

function rawToHiringStage(status: RawApplication['status']): HiringStage {
  switch (status) {
    case 'APPLIED':
      return 'Applied';
    case 'INTERVIEW':
      return 'Interview';
    case 'OFFER':
      return 'Offer';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Withdrawn';
  }
}

function buildApplicantDetail(raw: RawApplication): ApplicantDetail {
  const candidateId = raw.candidateId ?? String(raw.id);
  const candidateName =
    raw.candidate?.name?.trim() ||
    raw.candidate?.email ||
    `Candidate ${candidateId}`;
  const appliedRole = raw.job?.title ?? 'Unknown role';
  const appliedDate = raw.createdAt.split('T')[0];
  return {
    id: String(raw.id),
    applicantId: candidateId,
    name: candidateName,
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      candidateId
    )}`,
    email: raw.candidate?.email || '',
    phone: raw.candidate?.phone || '',
    title: appliedRole,
    jobListingId: String(raw.jobId ?? raw.id),
    appliedRole,
    jobCategory:
      raw.job?.category ??
      ({
        id: 0,
        name: 'General',
        slug: 'general',
      } as ApplicantDetail['jobCategory']),
    employmentType:
      (raw.job?.type as ApplicantDetail['employmentType']) ?? 'FULL_TIME',
    appliedDate,
    resume: raw.resume?.fileKey || '',
    score: raw.matchPercentage ?? 0,
    hiringStage: rawToHiringStage(raw.status),
  };
}

export default function AllApplicationsDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null);
  const [hiringStage, setHiringStage] = useState<HiringStage>('Applied');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromApi = useCallback(async () => {
    try {
      setError(null);
      const response = await listEmployerApplications({ pageSize: 100 });
      const raw = response.applications.find((a) => String(a.id) === id) as
        | RawApplication
        | undefined;
      if (!raw) {
        setError('Application not found');
        setApplicant(null);
        return;
      }
      const detailed = buildApplicantDetail(raw);
      setApplicant(detailed);
      setHiringStage(detailed.hiringStage);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load application';
      setError(message);
      Toast.show({ type: 'error', text1: 'Load Failed', text2: message });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Warm path: read from React Query cache first.
    const cached = queryClient.getQueryData<{
      pages: PaginatedApplicationsResponse[];
      pageParams: unknown[];
    }>(['employer-applications', 'all', 20]);

    let warm: ApplicantDetail | null = null;
    if (cached) {
      const all = cached.pages.flatMap((p) =>
        p.applications.map((raw) => buildApplicantDetail(raw as RawApplication))
      );
      warm = all.find((a) => a.id === id) ?? null;
    }
    if (warm) {
      setApplicant(warm);
      setHiringStage(warm.hiringStage);
      setLoading(false);
    }

    void loadFromApi();
  }, [id, loadFromApi, queryClient]);

  const handleHiringStageChange = useCallback((stage: HiringStage) => {
    setHiringStage(stage);
    setApplicant((prev) => (prev ? { ...prev, hiringStage: stage } : prev));
  }, []);

  if (loading && !applicant) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmployerDashboardHeader />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary2} />
          <Text className="mt-3 text-sm text-app-text-3">
            Loading application details…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !applicant) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmployerDashboardHeader />
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            activeOpacity={0.8}
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={32} color={COLORS.brandDark} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <View className="rounded-2xl border border-app-red-1 bg-[#FEF2F2] p-4 w-full max-w-md">
            <Text className="text-base font-semibold text-app-red-1 mb-1">
              {error}
            </Text>
            <Text className="text-sm text-app-red-1">
              Please try again or go back to the applications list.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setLoading(true);
                void loadFromApi();
              }}
              className="self-start mt-3 px-3 py-1.5 rounded-md border border-app-red-1"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-semibold text-app-red-1">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!applicant) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader />

      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          activeOpacity={0.8}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={32} color={COLORS.brandDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        <ApplicantOverview applicant={applicant} />
        <ApplicantDetails
          applicant={applicant}
          hiringStage={hiringStage}
          onHiringStageChange={handleHiringStageChange}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
