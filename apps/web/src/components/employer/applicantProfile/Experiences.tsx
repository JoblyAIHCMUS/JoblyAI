'use client';
import React from 'react';

export default function Experiences({ experiences }: { experiences: any[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[var(--space-base)] sm:py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] px-[var(--space-xs2)] sm:px-[var(--space-base)] mb-[var(--space-xs)]">
        Experiences
      </div>
      {experiences.map((exp, idx) => (
        <div
          key={idx}
          className="flex flex-col md:flex-row gap-[var(--space-xs)] md:gap-[var(--space-lg)] px-[var(--space-xs2)] sm:px-[var(--space-base)] py-[calc(var(--space-xs)*3)] sm:py-[var(--space-base)] min-w-0"
        >
          <img
            src={exp.logo}
            alt={exp.company}
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[var(--radius-xl)] object-cover mx-auto md:mx-0 shrink-0"
          />
          <div className="flex flex-col gap-[var(--space-xs)] flex-1 min-w-0">
            <div className="heading-h6-semi-bold text-[var(--text-primary)]">
              {exp.role}
            </div>
            <div className="flex flex-wrap items-center gap-[var(--space-xs)] body-body-1-regular text-[var(--text-secondary)] min-w-0">
              <span className="truncate max-w-[40vw] md:max-w-[20vw]">
                {exp.company}
              </span>
              <span className="w-[var(--size-xs2)] h-[var(--size-xs2)] bg-[var(--border-tertiary)] rounded-full inline-block"></span>
              <span>{exp.type}</span>
              <span className="w-[var(--size-xs2)] h-[var(--size-xs2)] bg-[var(--border-tertiary)] rounded-full inline-block"></span>
              <span>{exp.time}</span>
            </div>
            <div className="text-[var(--text-tertiary)] body-body-1-regular">
              {exp.location}
            </div>
            <div className="text-[var(--text-secondary)] body-body-1-regular break-words">
              {exp.desc}
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-[var(--space-xs2)] sm:px-[var(--space-base)]">
        <span className="text-[var(--text-accent-primary)] label-label-1-semi-bold cursor-pointer">
          Show 3 more experiences
        </span>
      </div>
    </div>
  );
}
