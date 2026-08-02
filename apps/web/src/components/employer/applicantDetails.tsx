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
import { Zap } from 'lucide-react';
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

  const canReject =
    hiringStage !== 'Rejected' &&
    hiringStage !== 'Withdrawn' &&
    hiringStage !== 'Offered';
  const canAdvance =
    !!nextStageMap[hiringStage] &&
    hiringStage !== 'Rejected' &&
    hiringStage !== 'Withdrawn' &&
    hiringStage !== 'Offered';

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

            <TabsContent value="hiring-process" className="mt-4 sm:mt-6">
              {(() => {
                const rawScore = applicant.score ?? 0;
                const displayScore =
                  rawScore <= 1 && rawScore > 0 ? rawScore * 100 : rawScore;
                const roundedScore = Math.round(displayScore);

                return (
                  <div className="mb-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-white p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-lg shadow-md">
                          {roundedScore}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              AI Candidate Match Score
                            </span>
                            <Badge
                              className={
                                roundedScore >= 70
                                  ? 'bg-emerald-600 text-white'
                                  : roundedScore >= 50
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-600 text-white'
                              }
                            >
                              {roundedScore >= 70
                                ? 'High Match'
                                : roundedScore >= 50
                                ? 'Moderate Match'
                                : 'Low Match'}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600">
                            Based on overall resume and profile alignment with job requirements
                          </p>
                        </div>
                      </div>

                      {roundedScore >= 60 && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50/90 px-3.5 py-2.5 text-xs text-amber-900 max-w-md">
                          <p className="font-bold flex items-center gap-1.5 text-amber-950">
                            <Zap className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
                            <span>Employer Consideration Highlight</span>
                          </p>
                          <p className="mt-0.5 text-[11px] text-amber-800 leading-snug">
                            High match score ({roundedScore}%). Even if pre-shortlist answers are not optimal, consider reviewing full candidate profile before making a final decision.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

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
                  score={applicant.score}
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
