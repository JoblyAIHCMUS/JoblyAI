'use client';
import React from 'react';
import type { CandidateSkill } from '@/api-client/candidate/types';

export default function Skills({ skills }: { skills?: CandidateSkill[] }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-base)] sm:px-[var(--space-lg)] py-[var(--space-base)] sm:py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full min-w-0">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] mb-[var(--space-xs)]">
          Skills
        </div>
        <div className="text-[var(--text-tertiary)]">No skills provided</div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-base)] sm:px-[var(--space-lg)] py-[var(--space-base)] sm:py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] mb-[var(--space-xs)]">
        Skills
      </div>
      <div className="flex flex-wrap gap-[var(--space-xs)]">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="px-[var(--space-xs)] py-[var(--space-xs2)] bg-[var(--bg-accent-primary)] rounded text-[var(--text-accent-primary)] label-label-1-semi-bold break-words"
          >
            {skill.title}
            {skill.level && (
              <span className="text-xs opacity-75"> ({skill.level})</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
