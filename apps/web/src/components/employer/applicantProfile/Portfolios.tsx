'use client';
import React from 'react';

interface Portfolio {
  img: string;
  name: string;
}

export default function Portfolios({ portfolios }: { portfolios: Portfolio[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--bg-primary)] px-[var(--space-base)] py-[var(--space-lg)] flex flex-col gap-[var(--space-base)] w-full">
      <div className="heading-h6-semi-bold text-[var(--text-primary)] mb-[var(--space-xs)]">
        Portfolios
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-xs)] sm:gap-[var(--space-base)]">
          {portfolios.map((p, idx) => (
            <div key={idx} className="flex flex-col gap-[var(--space-xs)]">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-[152px] rounded-[var(--radius-lg)] object-cover"
              />
              <div className="body-body-1-medium text-[var(--text-primary)]">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
