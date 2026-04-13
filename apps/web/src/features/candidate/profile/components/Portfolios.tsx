'use client';
import React from 'react';
import { Edit, Plus } from 'lucide-react';
import type { PortfolioItem } from '../types';

export default function Portfolios({
  portfolios,
}: {
  portfolios: PortfolioItem[];
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] px-[var(--space-lg)] py-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          Portfolios
        </div>
        <div className="flex gap-2">
          <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
            <Plus size={20} className="text-accent-primary" />
          </button>
          <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
            <Edit size={20} className="text-accent-primary" />
          </button>
        </div>
      </div>
      <div
        className="flex flex-row py-[var(--space-lg)] overflow-x-auto custom-scrollbar"
        style={{
          scrollbarColor: 'var(--text-accent-primary) var(--bg-primary)',
        }}
      >
        {portfolios.map((p, idx) => (
          <div key={idx} className="flex flex-col gap-2 min-w-[203px]">
            <img
              src={p.img}
              alt={p.name}
              className="w-[203px] h-[152px] rounded-[var(--radius-xl)] object-cover"
            />
            <div className="label-label-1-medium text-primary break-words">
              {p.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
