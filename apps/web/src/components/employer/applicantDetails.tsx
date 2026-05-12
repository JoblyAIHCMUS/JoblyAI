'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ApplicantResumeViewer from '@/components/employer/applicantResumeViewer';
import ApplicationNotes from '@/components/employer/applicationNotes';
import ApplicantProfile from '@/components/employer/applicantProfile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  hiringStageStyles,
  nextStageMap,
  HiringStage,
} from '@/features/employer/hiringStage';
import { type ApplicantDetail } from '@/features/employer/all-applications/detail/data';
import { useShortlistApplication } from '@/api-hook/application/useShortlistApplication';
import { useMoveToOfferApplication } from '@/api-hook/application/useMoveToOfferApplication';
import { useRejectApplication } from '@/api-hook/application/useRejectApplication';
import { useGetCandidateProfile } from '@/api-hook/candidate/useGetCandidateProfile';

export default function ApplicantDetails({
  applicant,
  hiringStage,
  setHiringStage,
}: {
  applicant: ApplicantDetail;
  hiringStage: HiringStage;
  setHiringStage: (stage: HiringStage) => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Callback for profile errors - memoized to prevent dependency changes
  const handleProfileError = useCallback((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load candidate profile';
    toast.error(message);
  }, []);

  // Fetch candidate profile
  const {
    fetchCandidateProfile,
    data: candidateProfile,
    loading: profileLoading,
    error: profileError,
  } = useGetCandidateProfile({
    onError: handleProfileError,
  });

  // Fetch profile only when applicantId changes
  useEffect(() => {
    if (applicant.applicantId) {
      fetchCandidateProfile(applicant.applicantId);
    }
  }, [applicant.applicantId, fetchCandidateProfile]);

  const { shortlistApplication } = useShortlistApplication({
    onSuccess: () => {
      setHiringStage('Interview');
      toast.success('Applicant moved to interview stage');
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to move applicant to interview';
      toast.error(message);
    },
  });

  const { moveToOffer } = useMoveToOfferApplication({
    onSuccess: () => {
      setHiringStage('Offer');
      toast.success('Applicant moved to offer stage');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to move to offer';
      toast.error(message);
    },
  });

  const { rejectApplication } = useRejectApplication({
    onSuccess: () => {
      setHiringStage('Rejected');
      toast.success('Applicant rejected');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to reject applicant';
      toast.error(message);
    },
  });

  const handleAdvanceStage = useCallback(async () => {
    setLoadingId(applicant.id);
    try {
      const applicationId = parseInt(applicant.id);
      if (hiringStage === 'Applied') {
        await shortlistApplication(applicationId);
      } else if (hiringStage === 'Interview') {
        await moveToOffer(applicationId);
      }
    } finally {
      setLoadingId(null);
    }
  }, [applicant.id, hiringStage, shortlistApplication, moveToOffer]);

  const handleDecline = useCallback(async () => {
    setLoadingId(applicant.id);
    try {
      const applicationId = parseInt(applicant.id);
      await rejectApplication(applicationId, { feedback: '' });
    } finally {
      setLoadingId(null);
    }
  }, [applicant.id, rejectApplication]);
  return (
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
            {/* Applicant Profile Section */}
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
            {/* Hiring Stage Control */}
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
                    disabled={
                      loadingId === applicant.id || hiringStage === 'Rejected'
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm h-9 sm:h-10 flex-1 xs:flex-none"
                    onClick={handleAdvanceStage}
                    disabled={
                      loadingId === applicant.id ||
                      !nextStageMap[hiringStage as HiringStage] ||
                      hiringStage === 'Rejected' ||
                      hiringStage === 'Withdrawn' ||
                      hiringStage === 'Offer'
                    }
                  >
                    Next Stage
                  </Button>
                </div>
              </div>
              <Separator />
            </div>
            <div className="mt-4 sm:mt-6">
              <ApplicationNotes />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
