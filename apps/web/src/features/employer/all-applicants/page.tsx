'use client';

import { useState } from 'react';

import AllApplicantsTable, {
  nextStageMap,
} from '@/components/employer/allApplicantsTable';
import {
  type AllApplicant,
  allApplicants as initialData,
} from '@/features/employer/all-applicants/data';

export default function EmployerAllApplicantsPage() {
  const [applicants, setApplicants] = useState<AllApplicant[]>(initialData);

  const advanceApplicant = (id: string) => {
    setApplicants((prev) =>
      prev.map((applicant) => {
        if (applicant.id !== id) return applicant;
        const next = nextStageMap[applicant.hiringStage];
        return next ? { ...applicant, hiringStage: next } : applicant;
      })
    );
  };

  const declineApplicant = (id: string) => {
    setApplicants((prev) =>
      prev.map((applicant) =>
        applicant.id === id
          ? { ...applicant, hiringStage: 'Declined' as const }
          : applicant
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Applicants</h1>
      <AllApplicantsTable
        applicants={applicants}
        advanceApplicant={advanceApplicant}
        declineApplicant={declineApplicant}
      />
    </div>
  );
}
