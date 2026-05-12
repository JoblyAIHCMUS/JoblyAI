'use client';
import React from 'react';

interface AboutData {
  title?: string;
  bio?: string;
}

export default function AboutMe({ about }: { about?: AboutData }) {
  if (!about || (!about.title && !about.bio)) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full min-w-0">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
          About Me
        </div>
        <div className="body-body-1-regular text-[var(--text-tertiary)] text-xs sm:text-sm">
          No about information provided
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full min-w-0">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
        About Me
      </div>
      {about.title && (
        <div className="body-body-1-medium text-[var(--text-primary)] break-words text-xs sm:text-sm mb-1 sm:mb-[var(--space-xs)]">
          {about.title}
        </div>
      )}
      {about.bio && (
        <div className="body-body-1-regular text-[var(--text-primary)] break-words text-xs sm:text-sm mb-1 sm:mb-[var(--space-xs)]">
          {about.bio}
        </div>
      )}
    </div>
  );
}
