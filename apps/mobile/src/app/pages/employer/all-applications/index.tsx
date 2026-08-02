import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import EmployerDashboardHeader from '../dashboard/components/EmployerDashboardHeader';
import EmployerDashboardSidebar from '../dashboard/components/EmployerDashboardSidebar';
import { AllApplicationsListItem } from './components/AllApplicationsListItem';
import { AllApplicationsRowMenu } from './components/AllApplicationsRowMenu';
import { HiringStageChangeConfirmModal } from './components/HiringStageChangeConfirmModal';

import { useEmployerAllApplications } from '../../../../hooks/useEmployerAllApplications';
import {
  useShortlistApplication,
  useRejectApplication,
  useMoveToOfferApplication,
} from '../../../../hooks/useEmployerJobApplications';
import { useGetEmployerProfile } from '../../../../hooks/useGetEmployerProfile';
import { useMessageCandidate } from '../../../../hooks/messaging/useMessageCandidate';
import { usePrefetchEmployerApplication } from '../../../../hooks/usePrefetchEmployerApplication';

import { AllApplication, HiringStage } from './types';
import { mapApiResponseToApplications, nextStageMap } from './data';
import { COLORS } from '@/app/constants/theme';

const REJECT_FEEDBACK =
  'Thank you for applying. We have decided to move forward with other candidates at this time.';

type ConfirmState = {
  open: boolean;
  actionType: 'advance' | 'reject' | null;
  application: AllApplication | null;
};

type OpenMenu = (
  application: AllApplication,
  triggerPosition: { x: number; y: number; width: number; height: number }
) => void;

function PrefetchableListItem({
  application,
  onPress,
  onMenuPress,
}: {
  application: AllApplication;
  onPress: () => void;
  onMenuPress: OpenMenu;
}) {
  const prefetch = usePrefetchEmployerApplication(application.id);
  return (
    <AllApplicationsListItem
      application={application}
      onPress={onPress}
      onMenuPress={onMenuPress}
      onPressIn={prefetch}
    />
  );
}

export default function AllApplicationsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    application: AllApplication | null;
    triggerPosition?: { x: number; y: number; width: number; height: number };
  }>({ visible: false, application: null });
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    actionType: null,
    application: null,
  });
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEmployerAllApplications();

  const { mutateAsync: shortlistApplication } = useShortlistApplication();
  const { mutateAsync: rejectApplication } = useRejectApplication();
  const { mutateAsync: moveToOffer } = useMoveToOfferApplication();
  const { data: employerProfile } = useGetEmployerProfile();
  const { mutateAsync: messageCandidate, isPending: isMessaging } =
    useMessageCandidate({ employerId: employerProfile?.id });

  const applications: AllApplication[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) =>
      mapApiResponseToApplications(page.applications)
    );
  }, [data]);

  const total = data?.pages[0]?.total ?? 0;

  const openMenu = useCallback(
    (
      application: AllApplication,
      triggerPosition: { x: number; y: number; width: number; height: number }
    ) => {
      setMenuState({ visible: true, application, triggerPosition });
    },
    []
  );

  const closeMenu = useCallback(() => {
    setMenuState({
      visible: false,
      application: null,
      triggerPosition: undefined,
    });
  }, []);

  const handleView = useCallback(
    (application: AllApplication) => {
      router.push(
        `/pages/employer/all-applications/${application.id}` as never
      );
    },
    [router]
  );

  const handleMessage = useCallback(
    async (application: AllApplication) => {
      try {
        await messageCandidate(application.applicantId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to open conversation';
        Toast.show({ type: 'error', text1: 'Message Failed', text2: message });
      }
    },
    [messageCandidate]
  );

  const requestAdvance = useCallback((application: AllApplication) => {
    setConfirmState({ open: true, actionType: 'advance', application });
  }, []);

  const requestDecline = useCallback((application: AllApplication) => {
    setConfirmState({ open: true, actionType: 'reject', application });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState({ open: false, actionType: null, application: null });
    setMutatingId(null);
  }, []);

  const performAdvance = useCallback(async () => {
    const { application } = confirmState;
    if (!application) return;
    const nextStage = nextStageMap[application.hiringStage];
    if (!nextStage) {
      closeConfirm();
      return;
    }
    setMutatingId(application.id);
    try {
      if (application.hiringStage === 'Applied') {
        await shortlistApplication(application.id);
      } else if (application.hiringStage === 'Interview') {
        await moveToOffer(application.id);
      }
      Toast.show({
        type: 'success',
        text1: 'Applicant advanced',
        text2: `Moved to ${nextStage}.`,
      });
      closeConfirm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to advance applicant';
      Toast.show({ type: 'error', text1: 'Advance Failed', text2: message });
      setMutatingId(null);
    }
  }, [confirmState, shortlistApplication, moveToOffer, closeConfirm]);

  const performDecline = useCallback(async () => {
    const { application } = confirmState;
    if (!application) return;
    setMutatingId(application.id);
    try {
      await rejectApplication({
        applicationId: application.id,
        feedback: REJECT_FEEDBACK,
      });
      Toast.show({
        type: 'success',
        text1: 'Applicant rejected',
        text2: 'They have been notified.',
      });
      closeConfirm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reject applicant';
      Toast.show({ type: 'error', text1: 'Reject Failed', text2: message });
      setMutatingId(null);
    }
  }, [confirmState, rejectApplication, closeConfirm]);

  const handleConfirm = useCallback(() => {
    if (confirmState.actionType === 'advance') {
      void performAdvance();
    } else if (confirmState.actionType === 'reject') {
      void performDecline();
    }
  }, [confirmState.actionType, performAdvance, performDecline]);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    if (isError) {
      return (
        <View className="mx-4 my-4 rounded-md border border-app-red-1 p-4 bg-app-tag-red-bg">
          <Text className="text-sm text-app-red-1 mb-2">
            Failed to load applications. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="self-start rounded-md border border-app-red-1 px-3 py-1.5"
            activeOpacity={0.7}
          >
            <Text className="text-sm font-semibold text-app-red-1">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View className="items-center py-10">
        <Text className="text-base text-app-text-3">
          No applications found.
        </Text>
      </View>
    );
  };

  if (isLoading && applications.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmployerDashboardHeader onMenuPress={() => setIsSidebarOpen(true)} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
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

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PrefetchableListItem
            application={item}
            onPress={() => handleView(item)}
            onMenuPress={openMenu}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="text-2xl font-bold text-app-slate-1 pt-2 pb-2">
            All Applications : {isLoading ? '...' : total}
          </Text>
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      />

      {(() => {
        const { application, triggerPosition } = menuState;
        if (!application) return null;
        return (
          <AllApplicationsRowMenu
            visible={menuState.visible}
            onClose={closeMenu}
            onView={() => handleView(application)}
            onMessage={() => handleMessage(application)}
            onAdvance={() => requestAdvance(application)}
            onDecline={() => requestDecline(application)}
            hiringStage={application.hiringStage as HiringStage}
            triggerPosition={triggerPosition}
            isLoading={
              isMessaging ||
              (mutatingId !== null && mutatingId === application.id)
            }
          />
        );
      })()}

      <HiringStageChangeConfirmModal
        visible={confirmState.open}
        actionType={confirmState.actionType}
        currentStage={confirmState.application?.hiringStage}
        nextStage={
          confirmState.application
            ? nextStageMap[confirmState.application.hiringStage]
            : undefined
        }
        applicantName={confirmState.application?.name}
        loading={
          mutatingId !== null && mutatingId === confirmState.application?.id
        }
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />

      <EmployerDashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </SafeAreaView>
  );
}
