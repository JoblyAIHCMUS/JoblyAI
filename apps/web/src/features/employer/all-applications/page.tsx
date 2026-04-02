'use client';

import { useEffect, useState } from 'react';

import AllApplicationsTable from '@/components/employer/allApplicationsTable';
import { nextStageMap } from '@/features/employer/hiringStage';
import { type AllApplication } from '@/features/employer/all-applications/data';
import { type PaginatedApplicationsResponse } from '@/api-client/application';
import { mapApplicationStatusToHiringStage } from '@/api-client/application/mappers';

import { useListEmployerApplications } from '@/api-hook/application';

function mapApiResponseToApplications(
  apiData: PaginatedApplicationsResponse
): AllApplication[] {
  return apiData.applications.map((application) => {
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
  const { fetchApplications } = useListEmployerApplications();

  const [applications, setApplications] = useState<AllApplication[]>([]);

  useEffect(() => {
    fetchApplications()
      .then((response) => {
        setApplications(mapApiResponseToApplications(response));
      })
      .catch((err) => {
        console.error('Failed to fetch applications:', err);
      });
  }, [fetchApplications]);

  const advanceApplicant = (id: string) => {
    setApplications((prev) =>
      prev.map((application) => {
        if (application.id !== id) return application;
        const next = nextStageMap[application.hiringStage];
        return next ? { ...application, hiringStage: next } : application;
      })
    );
  };

  const declineApplicant = (id: string) => {
    setApplications((prev) =>
      prev.map((application) =>
        application.id === id
          ? { ...application, hiringStage: 'Declined' as const }
          : application
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Applications</h1>
      <AllApplicationsTable
        applications={applications}
        advanceApplicant={advanceApplicant}
        declineApplicant={declineApplicant}
      />
    </div>
  );
}
