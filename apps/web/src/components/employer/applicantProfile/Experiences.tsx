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
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[var(--space-base)] sm:py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full min-w-0">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] mb-[var(--space-xs)]">
          Experiences
        </div>
        <div className="text-[var(--text-tertiary)] px-[var(--space-xs2)] sm:px-[var(--space-base)]">
          No experience information provided
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[var(--space-base)] sm:py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] mb-[var(--space-xs)]">
        Experiences
      </div>
      {experiences.slice(0, 3).map((exp) => (
        <div
          key={exp.id}
          className="flex flex-col gap-[var(--space-xs)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[var(--space-base)] border-b border-[var(--border-tertiary)] last:border-b-0"
        >
          <div className="heading-h6-semi-bold text-[var(--text-primary)]">
            {exp.jobTitle}
          </div>
          <div className="flex flex-wrap items-center gap-[var(--space-xs)] body-body-1-regular text-[var(--text-secondary)]">
            <span className="font-medium">{exp.companyName}</span>
            <span className="w-[var(--size-xs2)] h-[var(--size-xs2)] bg-[var(--border-tertiary)] rounded-full inline-block"></span>
            <span>{exp.type || 'Position'}</span>
            <span className="w-[var(--size-xs2)] h-[var(--size-xs2)] bg-[var(--border-tertiary)] rounded-full inline-block"></span>
            <span>{formatDateRange(exp.startDate, exp.endDate)}</span>
          </div>
          {exp.location && (
            <div className="text-[var(--text-tertiary)] body-body-1-regular">
              {exp.location}
            </div>
          )}
          {exp.description && (
            <div className="text-[var(--text-secondary)] body-body-1-regular break-words">
              {exp.description}
            </div>
          )}
        </div>
      ))}
      {experiences.length > 3 && (
        <div className="flex justify-end px-[var(--space-xs2)] sm:px-[var(--space-base)]">
          <span className="text-[var(--text-accent-primary)] label-label-1-semi-bold cursor-pointer">
            Show {experiences.length - 3} more experiences
          </span>
        </div>
      )}
    </div>
  );
}
