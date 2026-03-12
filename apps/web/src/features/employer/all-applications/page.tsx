'use client';

import { useState } from 'react';

import AllApplicationsTable from '@/components/employer/allApplicationsTable';
import { nextStageMap } from '@/features/employer/hiringStage';
import {
  type AllApplication,
  allApplications as initialData,
} from '@/features/employer/all-applications/data';

export default function EmployerAllApplicationsPage() {
  const [applications, setApplications] =
    useState<AllApplication[]>(initialData);

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
