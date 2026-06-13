import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import { COLORS } from '../../../constants/theme';
import { PaginatedApplicationsResponse } from '../../../../types/application';
import { mapApiResponseToApplications, hiringStageStyles } from './data';

export default function AllApplicationsDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  let applicantName: string | null = null;
  let appliedRole: string | null = null;
  let hiringStage: string | null = null;

  const cached = queryClient.getQueryData<{
    pages: PaginatedApplicationsResponse[];
    pageParams: unknown[];
  }>(['employer-applications', 'all', 20]);

  if (cached) {
    const all = cached.pages.flatMap((p) => mapApiResponseToApplications(p.applications));
    const found = all.find((a) => a.id === id);
    if (found) {
      applicantName = found.name;
      appliedRole = found.appliedRole;
      hiringStage = found.hiringStage;
    }
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

      <View className="px-4 pt-2">
        <Text className="text-2xl font-semibold text-app-slate-1">
          {applicantName ?? `Application #${id}`}
        </Text>
        {appliedRole && (
          <Text className="text-base text-app-text-3 mt-1">Applied for: {appliedRole}</Text>
        )}
        {hiringStage && (
          <View
            className={`mt-3 self-start border rounded-full px-4 py-1.5 ${
              hiringStageStyles[
                hiringStage as keyof typeof hiringStageStyles
              ] ?? 'border-app-border-2 text-app-slate-1'
            }`}
          >
            <Text className="text-sm font-semibold">{hiringStage}</Text>
          </View>
        )}

        <View className="mt-8 rounded-md border border-app-border-2 p-4 bg-app-background-2">
          <Text className="text-base font-semibold text-app-slate-1 mb-2">
            Detailed applicant view coming soon.
          </Text>
          <Text className="text-sm text-app-text-3">
            The full applicant profile, resume, and activity history will appear
            here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
