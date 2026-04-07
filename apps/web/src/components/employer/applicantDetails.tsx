'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ApplicantResumeViewer from './applicantResumeViewer';
import ApplicationNotes from './applicationNotes';
import ApplicantProfile from './applicantProfile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  hiringStageStyles,
  nextStageMap,
  HiringStage,
} from '@/features/employer/hiringStage';
import { type ApplicationRecord } from '@/api-client/application';
import { mapApplicationStatusToHiringStage } from '@/api-client/application/mappers';
import { useShortlistApplication } from '@/api-hook/application/useShortlistApplication';
import { useMoveToOfferApplication } from '@/api-hook/application/useMoveToOfferApplication';
import { useRejectApplication } from '@/api-hook/application/useRejectApplication';

export default function ApplicantDetails({
  applicant,
  onStatusChange,
}: {
  applicant: ApplicationRecord;
  onStatusChange?: () => void;
}) {
  const hiringStage = mapApplicationStatusToHiringStage(applicant.status);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const { shortlistApplication } = useShortlistApplication({
    onSuccess: () => {
      toast.success('Applicant moved to interview stage');
      onStatusChange?.();
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
      toast.success('Applicant moved to offer stage');
      onStatusChange?.();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to move to offer';
      toast.error(message);
    },
  });

  const { rejectApplication } = useRejectApplication({
    onSuccess: () => {
      toast.success('Applicant rejected');
      onStatusChange?.();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to reject applicant';
      toast.error(message);
    },
  });

  const handleAdvanceStage = async () => {
    setLoadingId(applicant.id.toString());
    try {
      if (hiringStage === 'Applied') {
        await shortlistApplication(applicant.id);
      } else if (hiringStage === 'Interview') {
        await moveToOffer(applicant.id);
      }
    } catch (error) {
      // Error is already handled by the hook callbacks
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async () => {
    setLoadingId(applicant.id.toString());
    try {
      await rejectApplication(applicant.id, { feedback: '' });
    } catch (error) {
      // Error is already handled by the hook callbacks
    } finally {
      setLoadingId(null);
    }
  };
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="inline-flex flex-wrap justify-start">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
            <TabsTrigger value="hiring-process">Hiring Process</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            {/* Applicant Profile Section */}
            <ApplicantProfile />
          </TabsContent>

          <TabsContent value="resume" className="mt-6">
            <ApplicantResumeViewer url={applicant.resume.fileKey || ''} />
          </TabsContent>

          <TabsContent value="cover-letter" className="mt-6">
            <p className="text-sm text-muted-foreground">
              Cover letter details coming soon.
            </p>
          </TabsContent>

          <TabsContent value="hiring-process" className="mt-6">
            {/* Hiring Stage Control */}
            <div className="mb-6">
              <div className="mb-2">
                <span className="block text-left label-label-1-semi-bold text-gray-700">
                  Current stage
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <Badge
                  variant="outline"
                  className={
                    hiringStageStyles[hiringStage] +
                    ' text-lg px-6 py-2 border-2'
                  }
                  style={{ fontSize: '1.25rem', minHeight: '2.5rem' }}
                >
                  {hiringStage}
                </Badge>
                <div className="flex gap-4 ml-auto">
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={handleDecline}
                    disabled={
                      loadingId === applicant.id.toString() ||
                      hiringStage === 'Rejected'
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAdvanceStage}
                    disabled={
                      loadingId === applicant.id.toString() ||
                      !nextStageMap[hiringStage as HiringStage] ||
                      hiringStage === 'Rejected' ||
                      hiringStage === 'Withdrawn' ||
                      hiringStage === 'Offer'
                    }
                  >
                    To Next Stage
                  </Button>
                </div>
              </div>
              <Separator />
            </div>
            <div className="mt-6">
              <ApplicationNotes />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
