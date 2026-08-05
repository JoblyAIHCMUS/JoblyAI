'use client';

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, SquarePen } from 'lucide-react-native';

// Components
import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import { CompanyBasicInfo } from './components/CompanyBasicInfo';
import { CompanyAbout } from './components/CompanyAbout';

// Hooks
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { useGetCompany } from '../../../../hooks/useGetCompany';

// Colors
import { COLORS } from '../../../constants/theme';
import * as Haptics from 'expo-haptics';

export default function CompanyProfilePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch employer profile to get company ID
  const {
    data: employer,
    isLoading: employerLoading,
    error: employerError,
    refetch: refetchEmployer,
  } = useGetEmployerProfile();

  // Fetch company data
  const {
    data: company,
    isLoading: companyLoading,
    error: companyError,
    refetch: refetchCompany,
  } = useGetCompany(employer?.company?.id);

  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const handleRefresh = async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const results = await Promise.allSettled([
        refetchEmployer(),
        employer?.company?.id
          ? refetchCompany()
          : Promise.resolve({ isError: false }),
      ]);
      const failed = results.some(
        (result) =>
          result.status === 'rejected' ||
          (result.status === 'fulfilled' && result.value.isError)
      );

      if (failed) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      }
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  const isCompanyAdmin = employer?.isCompanyAdmin ?? false;
  const showInitialLoading =
    (!employer && employerLoading) ||
    Boolean(employer?.company?.id && !company && companyLoading);
  const showEmployerError = Boolean(employerError && !employer);
  const showCompanyError = Boolean(companyError && !company);

  if (showInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary2} />
          <Text className="mt-4 text-base text-app-text-gray">
            Loading company profile…
          </Text>
        </View>
        <EmployerDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </SafeAreaView>
    );
  }

  if (showEmployerError) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center text-base">
            Failed to load employer profile.
          </Text>
        </View>
        <EmployerDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </SafeAreaView>
    );
  }

  if (showCompanyError) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center text-base">
            Failed to load company profile.
          </Text>
        </View>
        <EmployerDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </SafeAreaView>
    );
  }

  if (!company) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-slate-600">
            No company profile found.
          </Text>
        </View>
        <EmployerDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary2]}
            tintColor={COLORS.primary2}
          />
        }
      >
        {/* Back Button and Edit Button */}
        <View className="flex-row items-center px-4 py-3 justify-between">
          <TouchableOpacity
            activeOpacity={0.8}
            className="min-h-11 min-w-11 items-center justify-center"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.brandDark} />
          </TouchableOpacity>
          {isCompanyAdmin && (
            <TouchableOpacity
              activeOpacity={0.8}
              className="min-h-11 min-w-11 items-center justify-center"
              onPress={() => {
                router.push(`/pages/employer/edit-company`);
              }}
            >
              <SquarePen size={24} color={COLORS.primary2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Company Basic Info */}
        <CompanyBasicInfo company={company} />

        {/* Divider */}
        <View
          className="h-px bg-slate-200 my-4"
          style={{ backgroundColor: COLORS.border }}
        />

        {/* About Section */}
        <CompanyAbout description={company.description} />
      </ScrollView>

      {/* Sidebar */}
      <EmployerDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
