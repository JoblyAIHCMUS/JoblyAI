'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
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
import {
  useListEmployerApplications,
  useShortlistApplication,
  useRejectApplication,
  useMoveToOfferApplication,
} from '@/api-hook/application';
import { useUpdateJobStatus } from '@/api-hook/jobs/useUpdateJobStatus';
import { useEmployerJobDetail } from '@/api-hook/jobs/useEmployerJobDetail';
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
  const {
    fetchEmployerJobDetail,
    loading,
    error,
    data: backendJob,
  } = useEmployerJobDetail();
  // The route always provides an `id`; the only place this hook is mounted
  // is below `/employer/job-listing/[id]`. The jobId is passed into the
  // applications query so the list is scoped to this job.
  const parsedJobId = id ? parseInt(id, 10) : NaN;
  const jobId = !isNaN(parsedJobId) ? parsedJobId : undefined;
  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    error: applicationsError,
  } = useListEmployerApplications({ pageSize: 10, jobId });
  const { mutateAsync: shortlist } = useShortlistApplication();
  const { mutateAsync: reject } = useRejectApplication();
  const { mutateAsync: moveToOffer } = useMoveToOfferApplication();
  const { updateStatus: updateJobStatus, loading: statusUpdateLoading } =
    useUpdateJobStatus();

  const [statusUpdating, setStatusUpdating] = useState(false);

  // Derive applicants from the React Query cache. The mutations
  // (shortlist/reject/moveToOffer) invalidate the list cache, so this
  // memo automatically reflects the latest server state.
  const applicants = useMemo(
    () =>
      mapApplicationRecordsToApplicants(
        applicationsData?.pages.flatMap((p) => p.applications) ?? []
      ),
    [applicationsData]
  );

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
        await fetchEmployerJobDetail(jobId);
      } catch (err) {
        console.error('Failed to update job status:', err);
      } finally {
        setStatusUpdating(false);
      }
    },
    [id, updateJobStatus, fetchEmployerJobDetail]
  );

  // Fetch job details on mount. The applications list is auto-fetched by
  // useListEmployerApplications, which is keyed by the route's jobId.
  useEffect(() => {
    if (jobId !== undefined) {
      fetchEmployerJobDetail(jobId).catch((err: unknown) => {
        console.error('Failed to fetch job details:', err);
      });
    }
  }, [jobId, fetchEmployerJobDetail]);

  // Advance applicant to next stage
  const handleAdvanceApplicant = useCallback(
    async (applicantId: string) => {
      try {
        const appId = parseInt(applicantId, 10);
        // Find current applicant to determine next action
        const applicant = applicants.find((a) => a.id === applicantId);
        if (!applicant) {
          toast.error('Applicant not found');
          return;
        }

        if (applicant.hiringStage === 'Applied') {
          // Move from Applied to Interview
          await shortlist(appId);
        } else if (applicant.hiringStage === 'Interview') {
          // Move from Interview to Offer
          await moveToOffer(appId);
        }

        toast.success('Applicant advanced successfully');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to advance applicant';
        console.error('Failed to advance applicant:', err);
        toast.error(message);
      }
    },
    [applicants, shortlist, moveToOffer]
  );

  // Decline applicant
  const handleDeclineApplicant = useCallback(
    async (applicantId: string) => {
      try {
        const appId = parseInt(applicantId, 10);
        await reject({
          applicationId: appId,
          payload: {
            feedback:
              'Thank you for applying. We have decided to move forward with other candidates at this time.',
          },
        });

        toast.success('Applicant declined successfully');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to decline applicant';
        console.error('Failed to decline applicant:', err);
        toast.error(message);
      }
    },
    [reject]
  );

  // Handle Kanban stage changes
  // Note: Reordering within the same stage (targetId, position) is not supported.
  // Only actual stage transitions (Applied→Interview, Interview→Offer, →Rejected) trigger backend updates.
  const handleMoveApplicantToStage = useCallback(
    async (
      applicantId: string,
      newStage: HiringStage,
      targetId?: string,
      position?: 'before' | 'after'
    ) => {
      try {
        const appId = parseInt(applicantId, 10);
        const applicant = applicants.find((a) => a.id === applicantId);
        if (!applicant) {
          toast.error('Applicant not found');
          return;
        }

        const currentStage = applicant.hiringStage;

        // Early return if no stage change
        if (currentStage === newStage) {
          return;
        }

        // Track whether a backend action was taken
        let stageChangeApplied = false;

        // Only handle stage transitions that require backend calls
        if (newStage === 'Rejected') {
          // Move to Rejected
          await reject({
            applicationId: appId,
            payload: {
              feedback:
                'Thank you for applying. We have decided to move forward with other candidates at this time.',
            },
          });
          stageChangeApplied = true;
        } else if (currentStage === 'Applied' && newStage === 'Interview') {
          // Move from Applied to Interview
          await shortlist(appId);
          stageChangeApplied = true;
        } else if (currentStage === 'Interview' && newStage === 'Offer') {
          // Move from Interview to Offer
          await moveToOffer(appId);
          stageChangeApplied = true;
        }

        // Only refresh and show success if an actual stage change was applied
        if (stageChangeApplied) {
          toast.success('Applicant status updated successfully');
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update applicant status';
        console.error('Failed to move applicant to stage:', err);
        toast.error(message);
      }
    },
    [applicants, shortlist, moveToOffer, reject]
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
      <div className="w-full min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 border-b border-[#d6ddeb] bg-white">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex items-center gap-2 sm:gap-3">
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse flex-shrink-0" />
            <div className="h-6 w-48 sm:w-64 bg-gray-200 rounded animate-pulse flex-1" />
          </div>
        </div>
        <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || applicationsError) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 border-b border-[#d6ddeb] bg-white">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-3 sm:px-4 md:px-6">
          <div className="max-w-md w-full">
            <h1 className="text-lg sm:text-xl font-bold text-red-600 mb-2">
              Error Loading Job
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              {error instanceof Error
                ? error.message
                : applicationsError instanceof Error
                ? applicationsError.message
                : 'Failed to load job details'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 border-b border-[#d6ddeb] bg-white">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
            <h1 className="text-lg sm:text-xl font-bold">Job not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b border-[#d6ddeb] bg-white">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Top row: Back button and title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--text-primary)]" />
              </button>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] truncate">
                {job.title}
              </h1>
            </div>

            {/* Bottom row: Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                asChild
              >
                <Link
                  href={`/employer/job-listing/${id}/edit`}
                  aria-label="Edit job"
                >
                  <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Edit</span>
                </Link>
              </Button>

              {/* Status Dropdown */}
              {backendJob && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                      disabled={statusUpdating || statusUpdateLoading}
                    >
                      <span className="hidden sm:inline">Status: </span>
                      <span className="sm:hidden">S:</span>
                      {backendJob.status}
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
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-auto">
        <Tabs defaultValue="applicants" className="max-w-7xl mx-auto">
          <TabsList className="inline-flex flex-wrap justify-start gap-1 sm:gap-2 bg-transparent p-0 h-auto mb-4 sm:mb-6 overflow-x-auto">
            <TabsTrigger
              value="applicants"
              className="text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
            >
              Applicants
            </TabsTrigger>
            <TabsTrigger
              value="job-details"
              className="text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
            >
              Job Details
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="text-xs sm:text-sm py-2 px-2 sm:px-3 whitespace-nowrap rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600"
            >
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicants" className="mt-4 sm:mt-6">
            <JobApplicantsView
              applicants={job.applicants}
              onAdvanceApplicant={handleAdvanceApplicant}
              onDeclineApplicant={handleDeclineApplicant}
              onMoveApplicant={handleMoveApplicantToStage}
            />
          </TabsContent>

          <TabsContent value="job-details" className="mt-4 sm:mt-6">
            <JobDetailsReview job={job} />
          </TabsContent>

          <TabsContent value="stats" className="mt-4 sm:mt-6">
            <JobStatsPanel jobId={parseInt(id as string, 10)} job={job} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
