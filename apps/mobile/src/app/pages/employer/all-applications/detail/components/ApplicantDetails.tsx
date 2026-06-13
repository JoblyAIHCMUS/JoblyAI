import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

import { ApplicantDetail, nextStageMap } from '../../data';
import { HiringStage } from '../../types';
import { useGetCandidateProfileById } from '../../../../../../hooks/useGetCandidateProfileById';
import {
  useShortlistApplication,
  useRejectApplication,
  useMoveToOfferApplication,
} from '../../../../../../hooks/useEmployerJobApplications';
import { HiringStageChangeConfirmModal } from '../../components/HiringStageChangeConfirmModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { ApplicantProfilePanel } from './ApplicantProfilePanel';
import { ApplicantResumePanel } from './ApplicantResumePanel';
import { CoverLetterPanel } from './CoverLetterPanel';
import { HiringProcessPanel } from './HiringProcessPanel';

type TabValue = 'profile' | 'resume' | 'cover-letter' | 'hiring-process';

const TAB_VALUES: TabValue[] = [
  'profile',
  'resume',
  'cover-letter',
  'hiring-process',
];

type ConfirmAction = 'advance' | 'reject';

interface ConfirmState {
  open: boolean;
  actionType: ConfirmAction | null;
}

const REJECT_FEEDBACK =
  'Thank you for applying. We have decided to move forward with other candidates at this time.';

const TAB_LABELS: Record<TabValue, string> = {
  profile: 'Profile',
  resume: 'Resume',
  'cover-letter': 'Cover Letter',
  'hiring-process': 'Hiring Process',
};

interface ApplicantDetailsProps {
  applicant: ApplicantDetail;
  hiringStage: HiringStage;
  onHiringStageChange: (stage: HiringStage) => void;
}

export function ApplicantDetails({
  applicant,
  hiringStage,
  onHiringStageChange,
}: ApplicantDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('profile');
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    actionType: null,
  });
  const [isMutating, setIsMutating] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetCandidateProfileById(applicant.applicantId);

  const { mutateAsync: shortlistApplication } = useShortlistApplication();
  const { mutateAsync: rejectApplication } = useRejectApplication();
  const { mutateAsync: moveToOffer } = useMoveToOfferApplication();

  const closeConfirm = useCallback(() => {
    setConfirmState({ open: false, actionType: null });
  }, []);

  const requestAdvance = useCallback(() => {
    setConfirmState({ open: true, actionType: 'advance' });
  }, []);

  const requestDecline = useCallback(() => {
    setConfirmState({ open: true, actionType: 'reject' });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (isMutating) return;
    setIsMutating(true);
    try {
      if (confirmState.actionType === 'advance') {
        if (hiringStage === 'Applied') {
          await shortlistApplication(applicant.id);
        } else if (hiringStage === 'Interview') {
          await moveToOffer(applicant.id);
        }
        const next = nextStageMap[hiringStage];
        if (next) onHiringStageChange(next);
        Toast.show({
          type: 'success',
          text1: 'Applicant advanced',
          text2: next ? `Moved to ${next}.` : undefined,
        });
      } else if (confirmState.actionType === 'reject') {
        await rejectApplication({
          applicationId: applicant.id,
          feedback: REJECT_FEEDBACK,
        });
        onHiringStageChange('Rejected');
        Toast.show({
          type: 'success',
          text1: 'Applicant rejected',
          text2: 'They have been notified.',
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update applicant';
      Toast.show({
        type: 'error',
        text1:
          confirmState.actionType === 'reject'
            ? 'Reject Failed'
            : 'Advance Failed',
        text2: message,
      });
    } finally {
      setIsMutating(false);
      closeConfirm();
    }
  }, [
    applicant.id,
    closeConfirm,
    confirmState.actionType,
    hiringStage,
    isMutating,
    moveToOffer,
    onHiringStageChange,
    rejectApplication,
    shortlistApplication,
  ]);

  return (
    <View>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList>
          {TAB_VALUES.map((v) => (
            <TabsTrigger key={v} value={v} label={TAB_LABELS[v]} />
          ))}
        </TabsList>

        <TabsContent value="profile">
          <ApplicantProfilePanel
            profile={profile}
            loading={profileLoading}
            error={profileError}
          />
        </TabsContent>
        <TabsContent value="resume">
          <ApplicantResumePanel fileKey={applicant.resume} />
        </TabsContent>
        <TabsContent value="cover-letter">
          <CoverLetterPanel />
        </TabsContent>
        <TabsContent value="hiring-process">
          <HiringProcessPanel
            hiringStage={hiringStage}
            onRequestAdvance={requestAdvance}
            onRequestDecline={requestDecline}
            disabled={isMutating}
          />
        </TabsContent>
      </Tabs>

      <HiringStageChangeConfirmModal
        visible={confirmState.open}
        actionType={confirmState.actionType}
        currentStage={hiringStage}
        nextStage={
          confirmState.actionType === 'advance'
            ? nextStageMap[hiringStage]
            : undefined
        }
        applicantName={applicant.name}
        loading={isMutating}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />
    </View>
  );
}
