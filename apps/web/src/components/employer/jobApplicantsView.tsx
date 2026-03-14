'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobApplicantsTable from '@/components/employer/jobApplicantsTable';
import JobApplicantsKanban from '@/components/employer/jobApplicantsKanban';

import { type Applicant } from '@/features/employer/job-listing/detail/data';
import {
  type HiringStage,
  nextStageMap,
} from '@/features/employer/hiringStage';

interface JobApplicantsViewProps {
  applicants: Applicant[];
}

export default function JobApplicantsView({
  applicants: initialApplicants,
}: JobApplicantsViewProps) {
  const [data, setData] = useState<Applicant[]>(initialApplicants);

  const advanceApplicant = (id: string) => {
    setData((prev) =>
      prev.map((applicant) => {
        if (applicant.id !== id) return applicant;
        const next = nextStageMap[applicant.hiringStage];
        return next ? { ...applicant, hiringStage: next } : applicant;
      })
    );
  };

  const declineApplicant = (id: string) => {
    setData((prev) =>
      prev.map((applicant) =>
        applicant.id === id
          ? { ...applicant, hiringStage: 'Declined' as const }
          : applicant
      )
    );
  };

  const moveApplicantToStage = (
    id: string,
    stage: HiringStage,
    targetId?: string,
    position?: 'before' | 'after'
  ) => {
    setData((prev) => {
      const draggedIndex = prev.findIndex((a) => a.id === id);
      if (draggedIndex === -1) return prev;

      const dragged = { ...prev[draggedIndex], hiringStage: stage };
      const without = prev.filter((a) => a.id !== id);

      if (!targetId) {
        // Dropped on column background — append after the last item of that stage
        let insertIndex = without.length;
        for (let i = without.length - 1; i >= 0; i--) {
          if (without[i].hiringStage === stage) {
            insertIndex = i + 1;
            break;
          }
        }
        without.splice(insertIndex, 0, dragged);
        return without;
      }

      const targetIndex = without.findIndex((a) => a.id === targetId);
      if (targetIndex === -1) {
        without.push(dragged);
        return without;
      }

      const insertAt = position === 'before' ? targetIndex : targetIndex + 1;
      without.splice(insertAt, 0, dragged);
      return without;
    });
  };

  return (
    <Tabs defaultValue="table">
      <TabsList>
        <TabsTrigger value="table">
          <List className="mr-2 h-4 w-4" />
          Table View
        </TabsTrigger>
        <TabsTrigger value="kanban">
          <LayoutGrid className="mr-2 h-4 w-4" />
          Kanban View
        </TabsTrigger>
      </TabsList>

      <TabsContent value="table">
        <JobApplicantsTable
          applicants={data}
          advanceApplicant={advanceApplicant}
          declineApplicant={declineApplicant}
        />
      </TabsContent>

      <TabsContent value="kanban">
        <JobApplicantsKanban
          applicants={data}
          onStageChange={moveApplicantToStage}
        />
      </TabsContent>
    </Tabs>
  );
}
