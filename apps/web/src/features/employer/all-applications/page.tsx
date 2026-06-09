'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import AllApplicationsTable from '@/components/employer/allApplicationsTable';
import { type AllApplication } from '@/features/employer/all-applications/data';
import { type PaginatedApplicationsResponse } from '@/api-client/application';
import { mapApplicationStatusToHiringStage } from '@/api-client/application/mappers';

import {
  useListEmployerApplications,
  useShortlistApplication,
  useRejectApplication,
  useMoveToOfferApplication,
} from '@/api-hook/application';

function mapApiResponseToApplications(
  apiData: PaginatedApplicationsResponse['applications']
): AllApplication[] {
  return apiData.map((application) => {
    const displayName =
      application.candidate?.name?.trim() ||
      application.candidate?.email ||
      `Candidate ${application.candidateId}`;

    return {
      id: String(application.id),
      applicantId: application.candidateId,
      name: displayName,
      //TODO: Use real image when available
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        application.candidateId
      )}`,
      appliedDate: application.createdAt.split('T')[0],
      score: application.matchPercentage !== null ? application.matchPercentage : 0,
      hiringStage: mapApplicationStatusToHiringStage(application.status),
      appliedRole: application.job.title,
    };
  });
}

export default function EmployerAllApplicationsPage() {
  const {
    fetchApplications,
    loading,
    error,
    data,
    pageSize,
    totalPages,
    total,
  } = useListEmployerApplications({ initialPageSize: 10 });

  const { shortlistApplication } = useShortlistApplication();
  const { rejectApplication } = useRejectApplication();
  const { moveToOffer } = useMoveToOfferApplication();

  const [currentPage, setCurrentPage] = useState(1);
  const [displayData, setDisplayData] = useState<AllApplication[]>([]);

  // Fetch applications when component mounts or page changes
  useEffect(() => {
    fetchApplications(undefined, currentPage).catch((err) => {
      console.error('Failed to fetch applications:', err);
    });
  }, [currentPage, fetchApplications]);

  // Map fetched data to display format
  useEffect(() => {
    if (data && data.length > 0) {
      const mapped = mapApiResponseToApplications(data);
      setDisplayData(mapped);
    } else {
      setDisplayData([]);
    }
  }, [data]);

  const advanceApplicant = useCallback(
    async (id: string) => {
      try {
        const appId = parseInt(id, 10);
        const applicant = displayData.find((a) => a.id === id);
        if (!applicant) {
          toast.error('Applicant not found');
          return;
        }

        // Call appropriate API based on current hiring stage
        if (applicant.hiringStage === 'Applied') {
          await shortlistApplication(appId);
        } else if (applicant.hiringStage === 'Interview') {
          await moveToOffer(appId);
        }

        // Refresh the current page after advancing
        await fetchApplications(undefined, currentPage);
        toast.success('Applicant advanced successfully');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to advance applicant';
        console.error('Failed to advance applicant:', err);
        toast.error(message);
      }
    },
    [
      displayData,
      currentPage,
      fetchApplications,
      shortlistApplication,
      moveToOffer,
    ]
  );

  const declineApplicant = useCallback(
    async (id: string) => {
      try {
        const appId = parseInt(id, 10);
        await rejectApplication(appId, {
          feedback:
            'Thank you for applying. We have decided to move forward with other candidates at this time.',
        });

        // Refresh the current page after declining
        await fetchApplications(undefined, currentPage);
        toast.success('Applicant declined successfully');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to decline applicant';
        console.error('Failed to decline applicant:', err);
        toast.error(message);
      }
    },
    [currentPage, fetchApplications, rejectApplication]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  if (error) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-3 sm:p-4 md:p-5">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-700">
              Failed to load applications. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <h1 className="heading-h4-semi-bold mb-4 sm:mb-6 md:mb-8 text-2xl sm:text-3xl md:text-4xl">
        All Applications
      </h1>
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {loading && displayData.length === 0 && (
          <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
            <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && displayData.length === 0 && (
          <div className="text-center py-8 sm:py-10 md:py-12">
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              No applications found.
            </p>
          </div>
        )}

        {displayData.length > 0 && (
          <AllApplicationsTable
            applications={displayData}
            advanceApplicant={advanceApplicant}
            declineApplicant={declineApplicant}
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            loading={loading}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
