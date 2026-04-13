'use client';

import { useEffect, useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useJobDetail } from '@/api-hook/jobs/useJobDetail';
import {
  useListEmployerApplications,
  useShortlistApplication,
  useRejectApplication,
  useMoveToOfferApplication,
} from '@/api-hook/application';
import { useInitializeConversation } from '@/api-hook/messages';
import { useUpdateJobStatus } from '@/api-hook/jobs/useUpdateJobStatus';
import { useUser } from '@/hooks/useUser';
import { mapJobPostingToListingDetail } from '@/api-client/jobs/mappers';
import { mapApplicationRecordsToApplicants } from '@/api-client/application/mappers';
import type { HiringStage } from '@/features/employer/hiringStage';
import type { JobStatus } from '@/types/job';
import JobApplicantsView from '@/components/employer/jobApplicantsView';
import JobDetailsReview from '@/components/employer/jobDetailsReview';
import JobStatsPanel from '@/components/employer/jobStatsPanel';

export default function JobListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: currentUser } = useUser();
  const { initChat } = useInitializeConversation();
  const { fetchJobDetail, loading, error, data: backendJob } = useJobDetail();
  const {
    fetchApplications,
    loading: applicationsLoading,
    error: applicationsError,
    data: applicationsData,
  } = useListEmployerApplications();
  const { shortlistApplication } = useShortlistApplication();
  const { rejectApplication } = useRejectApplication();
  const { moveToOffer } = useMoveToOfferApplication();
  const { updateStatus: updateJobStatus, loading: statusUpdateLoading } =
    useUpdateJobStatus();

  const [applicants, setApplicants] = useState(
    mapApplicationRecordsToApplicants([])
  );
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Get available status transitions based on current status
  const getAvailableStatusTransitions = useCallback(
    (currentStatus: string): { status: JobStatus; label: string }[] => {
      switch (currentStatus) {
        case 'DRAFT':
          return [
            { status: 'OPEN', label: 'Publish' },
            { status: 'CLOSED', label: 'Mark as Closed' },
          ];
        case 'OPEN':
          return [
            { status: 'DRAFT', label: 'Revert to Draft' },
            { status: 'CLOSED', label: 'Close' },
          ];
        case 'CLOSED':
          return [
            { status: 'DRAFT', label: 'Revert to Draft' },
            { status: 'OPEN', label: 'Reopen' },
          ];
        default:
          return [];
      }
    },
    []
  );

  // Handle status change
  const handleStatusChange = useCallback(
    async (newStatus: JobStatus) => {
      if (!id) return;
      try {
        setStatusUpdating(true);
        const jobId = parseInt(id as string, 10);
        await updateJobStatus(jobId, newStatus);
        // Refresh job details after status change
        await fetchJobDetail(jobId);
      } catch (err) {
        console.error('Failed to update job status:', err);
      } finally {
        setStatusUpdating(false);
      }
    },
    [id, updateJobStatus, fetchJobDetail]
  );

  // Fetch job details on mount
  useEffect(() => {
    if (id) {
      const jobId = parseInt(id, 10);
      if (!isNaN(jobId)) {
        fetchJobDetail(jobId).catch((err) => {
          console.error('Failed to fetch job details:', err);
        });
        // Fetch applications for this job
        fetchApplications({ jobId }).catch((err) => {
          console.error('Failed to fetch applications:', err);
        });
      }
    }
  }, [id, fetchJobDetail, fetchApplications]);

  // Update applicants when data changes
  useEffect(() => {
    if (applicationsData) {
      setApplicants(mapApplicationRecordsToApplicants(applicationsData));
    }
  }, [applicationsData]);

  // Advance applicant to next stage
  const handleAdvanceApplicant = useCallback(
    async (applicantId: string) => {
      try {
        const appId = parseInt(applicantId, 10);
        // Find current applicant to determine next action
        const applicant = applicants.find((a) => a.id === applicantId);
        if (!applicant) return;

        if (applicant.hiringStage === 'Applied') {
          // Move from Applied to Interview
          await shortlistApplication(appId);
        } else if (applicant.hiringStage === 'Interview') {
          // Move from Interview to Offer
          await moveToOffer(appId);
        }

        // Refresh applications
        const jobId = parseInt(id as string, 10);
        if (!isNaN(jobId)) {
          await fetchApplications({ jobId });
        }
      } catch (err) {
        console.error('Failed to advance applicant:', err);
      }
    },
    [applicants, id, shortlistApplication, moveToOffer, fetchApplications]
  );

  // Decline applicant
  const handleDeclineApplicant = useCallback(
    async (applicantId: string) => {
      try {
        const appId = parseInt(applicantId, 10);
        await rejectApplication(appId, {
          feedback:
            'Thank you for applying. We have decided to move forward with other candidates at this time.',
        });

        // Refresh applications
        const jobId = parseInt(id as string, 10);
        if (!isNaN(jobId)) {
          await fetchApplications({ jobId });
        }
      } catch (err) {
        console.error('Failed to decline applicant:', err);
      }
    },
    [id, rejectApplication, fetchApplications]
  );

  // Handle Kanban stage changes
  const handleMoveApplicantToStage = useCallback(
    async (applicantId: string, newStage: HiringStage) => {
      try {
        const appId = parseInt(applicantId, 10);
        const applicant = applicants.find((a) => a.id === applicantId);
        if (!applicant) return;

        // Only handle stage transitions that require backend calls
        const currentStage = applicant.hiringStage;

        if (newStage === 'Rejected') {
          // Move to Rejected
          await rejectApplication(appId, {
            feedback:
              'Thank you for applying. We have decided to move forward with other candidates at this time.',
          });
        } else if (currentStage === 'Applied' && newStage === 'Interview') {
          // Move from Applied to Interview
          await shortlistApplication(appId);
        } else if (currentStage === 'Interview' && newStage === 'Offer') {
          // Move from Interview to Offer
          await moveToOffer(appId);
        }
        // For other moves or reordering within the same stage, just update local state

        // Refresh applications
        const jobId = parseInt(id as string, 10);
        if (!isNaN(jobId)) {
          await fetchApplications({ jobId });
        }
      } catch (err) {
        console.error('Failed to move applicant to stage:', err);
      }
    },
    [
      applicants,
      id,
      shortlistApplication,
      moveToOffer,
      rejectApplication,
      fetchApplications,
    ]
  );

  // Message candidate
  const handleMessageCandidate = useCallback(
    async (applicantId: string) => {
      if (!currentUser?.id) {
        toast.error('User not found. Please log in again.');
        return;
      }

      try {
        await initChat(currentUser.id, applicantId);
        router.push(`/employer/messages?candidateId=${applicantId}`);
      } catch (error) {
        console.error('Error initiating conversation:', error);
        toast.error('Failed to start conversation with candidate');
      }
    },
    [currentUser?.id, initChat, router]
  );

  // Map backend data to frontend format
  const job = backendJob
    ? {
        ...mapJobPostingToListingDetail(backendJob),
        applicants: applicants,
      }
    : null;

  if (loading || applicationsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4">
          <ArrowLeft className="h-7 w-7 animate-pulse" />
          <div className="h-9 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="mt-8">
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || applicationsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Job</h1>
          <p className="text-gray-600 mt-2">
            {error instanceof Error
              ? error.message
              : applicationsError instanceof Error
              ? applicationsError.message
              : 'Failed to load job details'}
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Job not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <Button variant="outline" size="icon" className="ml-2" asChild>
          <Link href={`/employer/job-listing/${id}/edit`} aria-label="Edit job">
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>

        {/* Status Dropdown */}
        {backendJob && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={statusUpdating || statusUpdateLoading}
              >
                Status: {backendJob.status}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {getAvailableStatusTransitions(backendJob.status).map(
                (option) => (
                  <DropdownMenuItem
                    key={option.status}
                    onClick={() => handleStatusChange(option.status)}
                    disabled={statusUpdating || statusUpdateLoading}
                  >
                    {option.label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Tabs defaultValue="applicants" className="mt-8">
        <TabsList>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="job-details">Job Details</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="mt-6">
          <JobApplicantsView
            applicants={job.applicants}
            onAdvanceApplicant={handleAdvanceApplicant}
            onDeclineApplicant={handleDeclineApplicant}
            onMessageCandidate={handleMessageCandidate}
            onMoveApplicant={handleMoveApplicantToStage}
          />
        </TabsContent>

        <TabsContent value="job-details" className="mt-6">
          <JobDetailsReview job={job} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <JobStatsPanel job={job} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
