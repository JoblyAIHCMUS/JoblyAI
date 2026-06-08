'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
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

export default function CompanyProfilePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch employer profile to get company ID
  const {
    data: employer,
    isLoading: employerLoading,
    error: employerError,
  } = useGetEmployerProfile();

  // Fetch company data
  const {
    data: company,
    isLoading: companyLoading,
    error: companyError,
  } = useGetCompany(employer?.company?.id);

  const isLoading =
    employerLoading || (employer?.company?.id && companyLoading);

  if (isLoading) {
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

  if (employerError) {
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

  if (employer?.company?.id && companyError) {
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
      >
        {/* Back Button and Edit Button */}
        <View className="flex-row items-center px-4 py-3 justify-between">
          <TouchableOpacity
            activeOpacity={0.8}
            className="p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.brandDark} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            className="p-1"
            onPress={() => {
              router.push(`/pages/employer/edit-company`);
            }}
          >
            <SquarePen size={24} color={COLORS.primary2} />
          </TouchableOpacity>
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
