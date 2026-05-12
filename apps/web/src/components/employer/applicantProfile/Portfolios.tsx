'use client';
import React from 'react';

interface Portfolio {
  img: string;
  name: string;
}

export default function Portfolios({
  portfolios,
}: {
  portfolios?: Portfolio[];
}) {
  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full">
        <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
          Portfolios
        </div>
        <div className="text-[var(--text-tertiary)] text-xs sm:text-sm">
          No portfolios provided
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-3 sm:px-[var(--space-base)] md:px-[var(--space-lg)] py-4 sm:py-[var(--space-base)] md:py-[var(--space-lg)] flex flex-col gap-3 sm:gap-[var(--space-base)] w-full">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-[var(--space-xs)]">
        Portfolios
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-[var(--space-base)]">
          {portfolios.map((p, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1 sm:gap-[var(--space-xs)]"
            >
              <img
                src={p.img}
                alt={p.name}
                className="w-full rounded-[var(--radius-lg)] object-cover aspect-video sm:aspect-square"
              />
              <div className="body-body-1-medium text-[var(--text-primary)] text-xs sm:text-sm line-clamp-2">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
