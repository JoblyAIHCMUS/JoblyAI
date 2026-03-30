'use client';
import React from 'react';
import { Edit, Plus } from 'lucide-react';

export default function AboutMe({ about }: { about: string[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          About Me
        </div>
        <div className="flex gap-2">
          <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
            <Plus size={20} className='text-accent-primary'/>
          </button>
          <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
            <Edit size={20} className='text-accent-primary'/>
          </button>
        </div>
      </div>
      {about.map((line, idx) => (
        <div
          key={idx}
          className="body-body-1-regular text-primary break-words"
        >
          {line}
        </div>
      ))}
    </div>
  );
}
