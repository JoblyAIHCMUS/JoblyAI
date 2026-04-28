'use client';
import React from 'react';

interface AboutData {
  title?: string;
  bio?: string;
}

export default function AboutMe({ about }: { about?: AboutData }) {
  if (!about || (!about.title && !about.bio)) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col gap-[var(--space-xs2)] w-full min-w-0">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] break-words">
          About Me
        </div>
        <div className="body-body-1-regular text-[var(--text-tertiary)]">
          No about information provided
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-xs2)] py-[var(--space-md)] flex flex-col gap-[var(--space-xs2)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] break-words">
        About Me
      </div>
      {about.title && (
        <div className="body-body-1-medium text-[var(--text-primary)] break-words">
          {about.title}
        </div>
      )}
      {about.bio && (
        <div className="body-body-1-regular text-[var(--text-primary)] break-words">
          {about.bio}
        </div>
      )}
    </div>
  );
}
