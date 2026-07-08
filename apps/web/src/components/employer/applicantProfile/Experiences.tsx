'use client';
import React from 'react';
import type { CandidateExperience } from '@/types/candidate';
import { formatDateRange } from '@/lib/formatters';

export default function Experiences({
  experiences,
}: {
  experiences?: CandidateExperience[];
}) {
  if (!experiences || experiences.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full min-w-0">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
          Experiences
        </div>
        <div className="text-[var(--text-tertiary)] text-xs sm:text-sm">
          No experience information provided
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
        Experiences
      </div>
      {experiences.slice(0, 3).map((exp) => (
        <div
          key={exp.id}
          className="flex flex-col gap-1 sm:gap-[var(--space-xs)] py-3 sm:py-[var(--space-base)] border-b border-[var(--border-tertiary)] last:border-b-0"
        >
          <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base">
            {exp.jobTitle}
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-[var(--space-xs)] body-body-1-regular text-[var(--text-secondary)] text-xs sm:text-sm">
            <span className="font-medium truncate">{exp.companyName}</span>
            <span className="w-1 h-1 sm:w-[var(--size-xs2)] sm:h-[var(--size-xs2)] bg-[var(--border-tertiary)] rounded-full inline-block flex-shrink-0"></span>
            <span className="whitespace-nowrap">{exp.type || 'Position'}</span>
            <span className="w-1 h-1 sm:w-[var(--size-xs2)] sm:h-[var(--size-xs2)] bg-[var(--border-tertiary)] rounded-full inline-block flex-shrink-0"></span>
            <span className="whitespace-nowrap">
              {formatDateRange(exp.startDate, exp.endDate)}
            </span>
          </div>
          {exp.location && (
            <div className="text-[var(--text-tertiary)] body-body-1-regular text-xs sm:text-sm">
              {typeof exp.location === 'object' && exp.location
                ? exp.location.formattedAddress
                : (exp.location as any)}
            </div>
          )}
          {exp.description && (
            <div className="text-[var(--text-secondary)] body-body-1-regular break-words text-xs sm:text-sm">
              {exp.description}
            </div>
          )}
        </div>
      ))}
      {experiences.length > 3 && (
        <div className="flex justify-end pt-2 sm:pt-0">
          <span className="text-[var(--text-accent-primary)] label-label-1-semi-bold cursor-pointer text-xs sm:text-sm">
            Show {experiences.length - 3} more
          </span>
        </div>
      )}
    </div>
  );
}
