'use client';
import React from 'react';
import type { CandidateSkill } from '@/api-client/candidate/types';

export default function Skills({ skills }: { skills?: CandidateSkill[] }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full min-w-0">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
          Skills
        </div>
        <div className="text-[var(--text-tertiary)] text-xs sm:text-sm">
          No skills provided
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
        Skills
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-[var(--space-xs)]">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="px-2 sm:px-[var(--space-xs)] py-1 sm:py-[var(--space-xs2)] bg-[var(--bg-accent-primary)] rounded text-[var(--text-accent-primary)] label-label-1-semi-bold break-words text-xs sm:text-sm"
          >
            {skill.title}
            {(skill.level ||
              (skill.years !== undefined && skill.years !== null)) && (
              <span className="text-xs opacity-75">
                {' '}
                (
                {[
                  skill.level
                    ? skill.level.charAt(0) + skill.level.slice(1).toLowerCase()
                    : null,
                  skill.years !== undefined && skill.years !== null
                    ? `${skill.years}y`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                )
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
