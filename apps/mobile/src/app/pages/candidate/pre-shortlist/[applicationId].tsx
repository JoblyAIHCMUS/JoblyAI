'use client';

import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/app/constants/theme';
import { useCandidatePreShortlist } from '../../../../hooks/useCandidatePreShortlist';
import { PreShortlistForm } from './components/PreShortlistForm';
import CandidateDashboardSidebar from '@/app/components/CandidateDashboardSidebar';
import { CandidateHeader } from '@/components/header/CandidateHeader';

const REDIRECT_STATUSES = ['APPLIED', 'WITHDRAWN'] as const;
const READ_ONLY_STATUSES = [
  'PRE_SHORTLIST_SUBMITTED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
] as const;

export default function PreShortlistPage() {
  const router = useRouter();
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const id = Number(applicationId);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { data, isLoading, isError, error, refetch } =
    useCandidatePreShortlist(id);

  // Defense in depth: if the application isn't actually in a pre-shortlist
  // state, or the employer removed all questions, bounce back to My
  // Applications. Mirrors apps/web/src/features/candidate/pre-shortlist/page.tsx
  useEffect(() => {
    if (!data) return;
    if (REDIRECT_STATUSES.includes(data.status as never)) {
      router.replace('/pages/candidate/my-applications');
      return;
    }
    if (data.questions.length === 0) {
      router.replace('/pages/candidate/my-applications');
    }
  }, [data, router]);

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={['top', 'left', 'right']}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <CandidateHeader
          title="Pre-Shortlist"
          initials="PS"
          onMenuPress={() => setIsSidebarOpen(true)}
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="mt-4 text-sm text-app-text-5">
            Loading pre-shortlist questions...
          </Text>
        </View>
        <CandidateDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPath="/pages/candidate/my-applications"
        />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={['top', 'left', 'right']}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <CandidateHeader
          title="Pre-Shortlist"
          initials="PS"
          onMenuPress={() => setIsSidebarOpen(true)}
        />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="mt-2 flex-row items-center gap-2">
            <AlertCircle size={20} color={COLORS.error ?? '#DC2626'} />
            <Text className="text-lg font-semibold text-app-text-4">
              Could not load pre-shortlist questions
            </Text>
          </View>
          <Text className="mt-2 text-sm leading-5 text-app-text-5">
            {error instanceof Error
              ? error.message
              : 'Please try again in a moment.'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              void refetch();
            }}
            className="mt-4 items-center rounded-xl border border-app-border-light bg-white px-4 py-2.5"
          >
            <Text className="text-sm font-semibold text-app-text-4">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/pages/candidate/my-applications')}
            className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl px-4 py-2.5"
          >
            <ArrowLeft size={14} color={COLORS.darkText} strokeWidth={2.2} />
            <Text className="text-sm font-semibold text-app-text-4">
              Back to applications
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <CandidateDashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPath="/pages/candidate/my-applications"
        />
      </SafeAreaView>
    );
  }

  const isReadOnly = (READ_ONLY_STATUSES as readonly string[]).includes(
    data.status
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <CandidateHeader
        title="Pre-Shortlist"
        initials="PS"
        onMenuPress={() => setIsSidebarOpen(true)}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <PreShortlistForm
          applicationId={id}
          data={data}
          readOnly={isReadOnly}
        />
      </ScrollView>
      <CandidateDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPath="/pages/candidate/my-applications"
      />
    </SafeAreaView>
  );
}
