'use client';
import React from 'react';

export default function AboutMe({ about }: { about: string[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col gap-[var(--space-xs2)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] break-words">
        About Me
      </div>
      {about.map((line, idx) => (
        <div
          key={idx}
          className="body-body-1-regular text-[var(--text-primary)] break-words"
        >
          {line}
        </div>
      ))}
    </div>
  );
}
