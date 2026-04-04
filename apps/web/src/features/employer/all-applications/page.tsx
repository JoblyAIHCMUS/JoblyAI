'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

import AllApplicationsTable from '@/components/employer/allApplicationsTable';
import { nextStageMap } from '@/features/employer/hiringStage';
import { type AllApplication } from '@/features/employer/all-applications/data';
import { type PaginatedApplicationsResponse } from '@/api-client/application';
import { mapApplicationStatusToHiringStage } from '@/api-client/application/mappers';

import { useListEmployerApplications } from '@/api-hook/application';

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
      score: 0, // TODO: Placeholder, as score is not available in the API response (AI not implemented yet)
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
      setDisplayData((prev) =>
        prev.map((application) => {
          if (application.id !== id) return application;
          const next = nextStageMap[application.hiringStage];
          return next ? { ...application, hiringStage: next } : application;
        })
      );
      // Refresh the current page after advancing
      try {
        await fetchApplications(undefined, currentPage);
      } catch (err) {
        console.error('Failed to refresh applications after advancing:', err);
      }
    },
    [fetchApplications, currentPage]
  );

  const declineApplicant = useCallback(
    async (id: string) => {
      setDisplayData((prev) =>
        prev.map((application) =>
          application.id === id
            ? { ...application, hiringStage: 'Declined' as const }
            : application
        )
      );
      // Refresh the current page after declining
      try {
        await fetchApplications(undefined, currentPage);
      } catch (err) {
        console.error('Failed to refresh applications after declining:', err);
      }
    },
    [fetchApplications, currentPage]
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
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">
              Failed to load applications. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="heading-h4-semi-bold mb-6">All Applications</h1>
      <div className="space-y-4">
        {loading && displayData.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && displayData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No applications found.</p>
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
