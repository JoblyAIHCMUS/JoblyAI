import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import { COLORS } from '../../../constants/theme';
import { useEmployerApplication } from '../../../../hooks/useEmployerApplication';
import { ApplicantOverview } from './detail/components/ApplicantOverview';
import { ApplicantDetails } from './detail/components/ApplicantDetails';
import * as Haptics from 'expo-haptics';

export default function AllApplicationsDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: applicant,
    isLoading,
    isError,
    error,
    refetch,
  } = useEmployerApplication(id);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const handleRefresh = async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const result = await refetch();
      if (result.isError) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  if (isLoading && !applicant) {
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

  if (isError && !applicant) {
    const message =
      error instanceof Error ? error.message : 'Application not found';
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmployerDashboardHeader />
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            activeOpacity={0.8}
            className="min-h-11 min-w-11 items-center justify-center"
            onPress={() => router.back()}
          >
            <ArrowLeft size={32} color={COLORS.brandDark} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <View className="rounded-2xl border border-app-red-1 bg-app-tag-red-bg p-4 w-full max-w-md">
            <Text className="text-base font-semibold text-app-red-1 mb-1">
              {message}
            </Text>
            <Text className="text-sm text-app-red-1">
              Please try again or go back to the applications list.
            </Text>
            <TouchableOpacity
              onPress={() => {
                void handleRefresh();
              }}
              className="self-start mt-3 min-h-11 items-center justify-center rounded-md border border-app-red-1 px-3 py-1.5"
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
          className="min-h-11 min-w-11 items-center justify-center"
          onPress={() => router.back()}
        >
          <ArrowLeft size={32} color={COLORS.brandDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary2]}
            tintColor={COLORS.primary2}
          />
        }
      >
        <ApplicantOverview applicant={applicant} />
        <ApplicantDetails applicant={applicant} />
      </ScrollView>
    </SafeAreaView>
  );
}
