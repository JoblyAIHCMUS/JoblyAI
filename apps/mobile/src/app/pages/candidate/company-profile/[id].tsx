'use client';

import { useEffect, useMemo, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Menu } from 'lucide-react-native';

import { useCompanyJobs, useGetCompany } from '../../../../hooks';
import { COLORS } from '../../../constants/theme';
import CandidateDashboardSidebar from '../dashboard/components/CandidateDashboardSidebar';
import { CompanyJobsSection } from './CompanyJobsSection';
import { CompanyOverviewSection } from './CompanyOverviewSection';

export default function CandidateCompanyProfilePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [jobsPage, setJobsPage] = useState(1);

  const rawCompanyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const companyId = Number(rawCompanyId);
  const validCompanyId = Number.isFinite(companyId) && companyId > 0;

  const {
    data: company,
    isLoading: companyLoading,
    error: companyError,
    refetch: refetchCompany,
  } = useGetCompany(validCompanyId ? companyId : null);
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useCompanyJobs(validCompanyId ? companyId : null, jobsPage);

  const openJobs = useMemo(
    () => (jobsData?.jobs ?? []).filter((job) => job.status === 'OPEN'),
    [jobsData?.jobs]
  );

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetchCompany(), refetchJobs()]);
    } finally {
      setRefreshing(false);
    }
  };

  const openWebsite = () => {
    if (company?.websiteUrl) {
      void Linking.openURL(company.websiteUrl);
    }
  };

  const contentWidth = Math.max(280, width - 64);
  const isInitialLoading = companyLoading && !company;
  const hasCompanyError = companyError || !validCompanyId;
  const jobsTotalPages = Math.max(1, jobsData?.totalPages ?? jobsPage);

  useEffect(() => {
    setJobsPage(1);
  }, [companyId]);

  useEffect(() => {
    if (jobsData && jobsPage > jobsTotalPages) {
      setJobsPage(jobsTotalPages);
    }
  }, [jobsData, jobsPage, jobsTotalPages]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#f9fbff]"
      edges={['top', 'left', 'right']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <CandidateDashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath="/pages/candidate/browse-companies"
      />

      <View className="border-b border-app-border-1 bg-app-white-1 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center"
            onPress={() => setSidebarOpen(true)}
          >
            <Menu size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text className="flex-1 pl-3 text-lg font-bold text-app-text-4">
            Company
          </Text>
        </View>
      </View>

      {isInitialLoading ? (
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color={COLORS.primary2} />
          <Text className="mt-4 text-sm text-app-text-2">
            Loading company details...
          </Text>
        </View>
      ) : hasCompanyError || !company ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base font-semibold text-app-text-4">
            Unable to load this company.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            className="mt-5 rounded-lg bg-[#4640de] px-5 py-3"
            onPress={() => router.back()}
          >
            <Text className="font-bold text-white">Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View className="px-4 py-4">
            <TouchableOpacity
              activeOpacity={0.7}
              className="mb-4 h-10 w-10 items-center justify-center rounded-full border border-app-border-1 bg-app-white-1"
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={COLORS.text} />
            </TouchableOpacity>

            <CompanyOverviewSection
              company={company}
              contentWidth={contentWidth}
              openJobsCount={openJobs.length}
              onWebsitePress={openWebsite}
            />

            <CompanyJobsSection
              companyName={company.name}
              jobs={openJobs}
              isLoading={jobsLoading}
              error={jobsError}
              currentPage={jobsPage}
              totalPages={jobsTotalPages}
              onPageChange={setJobsPage}
              onApplyPress={() => router.push('/pages/candidate/find-jobs')}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
