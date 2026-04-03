'use client';
import React from 'react';

export default function Educations({ educations }: { educations: any[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[var(--space-base)] sm:py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] mb-[var(--space-xs)]">
        Educations
      </div>
      {educations.map((edu, idx) => (
        <div
          key={idx}
          className="flex flex-col md:flex-row gap-[var(--space-xs)] md:gap-[var(--space-lg)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[calc(var(--space-xs)*3)] sm:py-[var(--space-base)] min-w-0"
        >
          <img
            src={edu.logo}
            alt={edu.school}
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[var(--radius-xl)] object-cover mx-auto md:mx-0 shrink-0"
          />
          <div className="flex flex-col gap-[var(--space-xs)] flex-1 min-w-0">
            <div className="heading-h6-semi-bold text-[var(--text-primary)]">
              {edu.school}
            </div>
            <div className="body-body-1-regular text-[var(--text-secondary)]">
              {edu.degree}
            </div>
            <div className="body-body-1-regular text-[var(--text-secondary)]">
              {edu.time}
            </div>
            <div className="body-body-1-regular text-[var(--text-primary)] break-words">
              {edu.desc}
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-[var(--space-xs2)] sm:px-[var(--space-base)]">
        <span className="text-[var(--text-accent-primary)] label-label-1-semi-bold cursor-pointer">
          Show 2 more educations
        </span>
      </div>
    </div>
  );
}
