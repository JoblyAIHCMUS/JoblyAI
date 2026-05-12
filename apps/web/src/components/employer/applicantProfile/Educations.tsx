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
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full min-w-0">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
          Educations
        </div>
        <div className="text-[var(--text-tertiary)] text-xs sm:text-sm">
          No education information provided
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
        Educations
      </div>
      {educations.slice(0, 2).map((edu) => (
        <div
          key={edu.id}
          className="flex flex-col gap-1 sm:gap-[var(--space-xs)] py-3 sm:py-[var(--space-base)] border-b border-[var(--border-tertiary)] last:border-b-0"
        >
          <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base">
            {edu.school}
          </div>
          {edu.degree && (
            <div className="body-body-1-regular text-[var(--text-secondary)] text-xs sm:text-sm">
              {edu.degree}
            </div>
          )}
          <div className="body-body-1-regular text-[var(--text-secondary)] text-xs sm:text-sm">
            {formatDateRange(edu.startDate, edu.endDate)}
          </div>
          {edu.fieldOfStudy && (
            <div className="body-body-1-regular text-[var(--text-secondary)] text-xs sm:text-sm">
              {edu.fieldOfStudy}
            </div>
          )}
          {edu.description && (
            <div className="body-body-1-regular text-[var(--text-primary)] break-words text-xs sm:text-sm">
              {edu.description}
            </div>
          )}
        </div>
      ))}
      {educations.length > 2 && (
        <div className="flex justify-end pt-2 sm:pt-0">
          <span className="text-[var(--text-accent-primary)] label-label-1-semi-bold cursor-pointer text-xs sm:text-sm">
            Show {educations.length - 2} more
          </span>
        </div>
      )}
    </div>
  );
}
