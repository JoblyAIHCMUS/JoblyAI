'use client';

import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import AllApplicationsTable from '@/components/employer/allApplicationsTable';
import { type AllApplication } from '@/features/employer/all-applications/data';
import { mapApplicationStatusToHiringStage } from '@/api-client/application/mappers';

import {
  useListEmployerApplications,
  useShortlistApplication,
  useRejectApplication,
  useMoveToOfferApplication,
} from '@/api-hook/application';

export default function EmployerAllApplicationsPage() {
  const { data, isLoading, isError } = useListEmployerApplications();
  const { mutateAsync: shortlist } = useShortlistApplication();
  const { mutateAsync: reject } = useRejectApplication();
  const { mutateAsync: moveToOffer } = useMoveToOfferApplication();

  const applications: AllApplication[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) =>
      page.applications.map((a) => ({
        id: String(a.id),
        applicantId: a.candidateId,
        name:
          a.candidate?.name?.trim() ||
          a.candidate?.email ||
          `Candidate ${a.candidateId}`,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          a.candidateId
        )}`,
        appliedDate: a.createdAt.split('T')[0],
        score: a.matchPercentage ?? 0,
        hiringStage: mapApplicationStatusToHiringStage(a.status),
        appliedRole: a.job.title,
      }))
    );
  }, [data]);

  const total = data?.pages[0]?.total ?? 0;
  const totalPages = data?.pages[0]?.totalPages ?? 0;
  const currentPage = data?.pages[0]?.page ?? 1;

  const advanceApplicant = async (id: string) => {
    try {
      const appId = parseInt(id, 10);
      const applicant = applications.find((a) => a.id === id);
      if (!applicant) {
        toast.error('Applicant not found');
        return;
      }
      if (applicant.hiringStage === 'Applied') {
        await shortlist(appId);
      } else if (applicant.hiringStage === 'Interview') {
        await moveToOffer(appId);
      }
      toast.success('Applicant advanced successfully');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to advance applicant';
      toast.error(message);
    }
  };

  const declineApplicant = async (id: string) => {
    try {
      const appId = parseInt(id, 10);
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
      toast.error(message);
    }
  };

  if (isError) {
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
        {isLoading && applications.length === 0 && (
          <div className="flex items-center justify-center py-8 sm:py-10 md:py-12">
            <div className="h-7 w-7 sm:h-8 sm:h-8 md:h-9 md:w-9 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}

        {!isLoading && applications.length === 0 && (
          <div className="text-center py-8 sm:py-10 md:py-12">
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              No applications found.
            </p>
          </div>
        )}

        {applications.length > 0 && (
          <AllApplicationsTable
            applications={applications}
            advanceApplicant={advanceApplicant}
            declineApplicant={declineApplicant}
            pageSize={10}
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            loading={isLoading}
            onPageChange={() => {
              /* TODO: add pagination support in a follow-up */
            }}
          />
        )}
      </div>
    </div>
  );
}
