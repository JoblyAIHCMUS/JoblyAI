'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ApplicantResumeViewer from '@/components/employer/applicantResumeViewer';
import ApplicantProfile from '@/components/employer/applicantProfile';
import PreShortlistAssessment from '@/components/employer/applicantProfile/PreShortlistAssessment';
import HiringStageChangeConfirm from '@/components/employer/hiringStageChangeConfirm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  hiringStageStyles,
  nextStageMap,
  type HiringStage,
} from '@/features/employer/hiringStage';
import { type ApplicantDetail } from '@/features/employer/all-applications/detail/data';
import {
  useShortlistApplication,
  useMoveToOfferApplication,
  useRejectApplication,
} from '@/api-hook/application';
import { useGetCandidateProfile } from '@/api-hook/candidate/useGetCandidateProfile';
import { toast } from 'sonner';

const REJECT_FEEDBACK =
  'Thank you for applying. We have decided to move forward with other candidates at this time.';

export default function ApplicantDetails({
  applicant,
  refetch,
}: {
  applicant: ApplicantDetail;
  refetch?: () => Promise<unknown>;
}) {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    actionType: 'advance' | 'reject' | null;
  }>({ show: false, actionType: null });

  const hiringStage: HiringStage = applicant.hiringStage;

  const handleProfileError = useCallback((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load candidate profile';
    toast.error(message);
  }, []);

  const {
    fetchCandidateProfile,
    data: candidateProfile,
    loading: profileLoading,
    error: profileError,
  } = useGetCandidateProfile({ onError: handleProfileError });

  useEffect(() => {
    if (applicant.applicantId) {
      fetchCandidateProfile(applicant.applicantId);
    }
  }, [applicant.applicantId, fetchCandidateProfile]);

  const { mutateAsync: shortlistMutate, isPending: isShortlisting } =
    useShortlistApplication();
  const { mutateAsync: moveToOfferMutate, isPending: isMovingToOffer } =
    useMoveToOfferApplication();
  const { mutateAsync: rejectMutate, isPending: isRejecting } =
    useRejectApplication();

  const isMutating = isShortlisting || isMovingToOffer || isRejecting;

  const handleAdvanceStage = () => {
    setConfirmDialog({ show: true, actionType: 'advance' });
  };
  const handleDecline = () => {
    setConfirmDialog({ show: true, actionType: 'reject' });
  };

  const handleConfirmAction = async () => {
    const action = confirmDialog.actionType;
    setConfirmDialog({ show: false, actionType: null });
    const applicationId = parseInt(applicant.id, 10);
    try {
      if (action === 'advance') {
        if (hiringStage === 'Applied') {
          await shortlistMutate(applicationId);
        } else if (hiringStage === 'Interview') {
          await moveToOfferMutate(applicationId);
        }
      } else if (action === 'reject') {
        await rejectMutate({
          applicationId,
          payload: { feedback: REJECT_FEEDBACK },
        });
      }
      await refetch?.();
    } catch {
      // toasts handled in the hook
    }
  };

  const handleCancelDialog = () => {
    setConfirmDialog({ show: false, actionType: null });
  };

  const canReject = hiringStage !== 'Rejected';
  const canAdvance =
    !!nextStageMap[hiringStage] &&
    hiringStage !== 'Rejected' &&
    hiringStage !== 'Withdrawn' &&
    hiringStage !== 'Offer';

  return (
    <>
      <Card className="w-full">
        <CardContent className="pt-4 sm:pt-5 md:pt-6 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="inline-flex flex-wrap justify-start gap-1 sm:gap-2 bg-transparent p-0 h-auto mb-4 sm:mb-6 overflow-x-auto">
              <TabsTrigger
                value="profile"
                className="text-xs sm:text-sm py-2 px-2 sm:px-3"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="resume"
                className="text-xs sm:text-sm py-2 px-2 sm:px-3"
              >
                Resume
              </TabsTrigger>
              <TabsTrigger
                value="cover-letter"
                className="text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap"
              >
                Cover Letter
              </TabsTrigger>
              <TabsTrigger
                value="hiring-process"
                className="text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap"
              >
                Hiring Process
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4 sm:mt-6">
              {profileLoading ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="text-[var(--text-secondary)] text-sm sm:text-base">
                    Loading profile...
                  </div>
                </div>
              ) : profileError ? (
                <div className="flex items-center justify-center py-8 sm:py-12">
                  <div className="text-[var(--text-tertiary)] text-sm sm:text-base">
                    Unable to load profile. Showing basic information.
                  </div>
                </div>
              ) : null}
              <ApplicantProfile profile={candidateProfile || undefined} />
            </TabsContent>

            <TabsContent value="resume" className="mt-4 sm:mt-6">
              <ApplicantResumeViewer fileKey={applicant.resume} />
            </TabsContent>

            <TabsContent value="cover-letter" className="mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cover letter details coming soon.
              </p>
            </TabsContent>

            <TabsContent value="hiring-process" className="mt-4 sm:mt-6">
              <div className="mb-4 sm:mb-6">
                <div className="mb-2 sm:mb-3">
                  <span className="block text-left label-label-1-semi-bold text-gray-700 text-xs sm:text-sm">
                    Current stage
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                  <Badge
                    variant="outline"
                    className={`${hiringStageStyles[hiringStage]} text-sm sm:text-base py-2 px-3 sm:px-4 border-2 whitespace-nowrap w-fit`}
                  >
                    {hiringStage}
                  </Badge>
                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-600 hover:bg-red-50 text-xs sm:text-sm h-9 sm:h-10 flex-1 xs:flex-none"
                      onClick={handleDecline}
                      disabled={isMutating || !canReject}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm h-9 sm:h-10 flex-1 xs:flex-none"
                      onClick={handleAdvanceStage}
                      disabled={
                        isMutating || !canAdvance || !nextStageMap[hiringStage]
                      }
                    >
                      {nextStageMap[hiringStage]
                        ? `Advance to ${nextStageMap[hiringStage]}`
                        : 'Next Stage'}
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>
              <div className="mt-4 sm:mt-6">
                <PreShortlistAssessment
                  applicationId={applicant.id}
                  jobId={applicant.jobListingId}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {confirmDialog.show && (
        <HiringStageChangeConfirm
          actionType={confirmDialog.actionType as 'advance' | 'reject'}
          currentStage={hiringStage}
          nextStage={nextStageMap[hiringStage]}
          onCancel={handleCancelDialog}
          onConfirm={handleConfirmAction}
          loading={isMutating}
        />
      )}
    </>
  );
}
