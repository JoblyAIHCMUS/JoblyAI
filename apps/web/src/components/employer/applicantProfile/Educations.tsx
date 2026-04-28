'use client';
import React from 'react';
import type { CandidateEducation } from '@/types/candidate';
import { formatDateRange } from '@/lib/formatters';

export default function Educations({
  educations,
}: {
  educations?: CandidateEducation[];
}) {
  if (!educations || educations.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[var(--space-base)] sm:py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full min-w-0">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] mb-[var(--space-xs)]">
          Educations
        </div>
        <div className="text-[var(--text-tertiary)] px-[var(--space-xs2)] sm:px-[var(--space-base)]">
          No education information provided
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[var(--space-base)] sm:py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] mb-[var(--space-xs)]">
        Educations
      </div>
      {educations.slice(0, 2).map((edu) => (
        <div
          key={edu.id}
          className="flex flex-col gap-[var(--space-xs)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[var(--space-base)] border-b border-[var(--border-tertiary)] last:border-b-0"
        >
          <div className="heading-h6-semi-bold text-[var(--text-primary)]">
            {edu.school}
          </div>
          {edu.degree && (
            <div className="body-body-1-regular text-[var(--text-secondary)]">
              {edu.degree}
            </div>
          )}
          <div className="body-body-1-regular text-[var(--text-secondary)]">
            {formatDateRange(edu.startDate, edu.endDate)}
          </div>
          {edu.fieldOfStudy && (
            <div className="body-body-1-regular text-[var(--text-secondary)]">
              {edu.fieldOfStudy}
            </div>
          )}
          {edu.description && (
            <div className="body-body-1-regular text-[var(--text-primary)] break-words">
              {edu.description}
            </div>
          )}
        </div>
      ))}
      {educations.length > 2 && (
        <div className="flex justify-end px-[var(--space-xs2)] sm:px-[var(--space-base)]">
          <span className="text-[var(--text-accent-primary)] label-label-1-semi-bold cursor-pointer">
            Show {educations.length - 2} more educations
          </span>
        </div>
      )}
    </div>
  );
}
