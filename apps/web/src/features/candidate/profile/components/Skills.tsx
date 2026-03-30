'use client';
import React from 'react';
import { Edit, Plus } from 'lucide-react';

export default function Skills({ skills }: { skills: string[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between">
        <div className="heading-h6-semi-bold text-primary break-words">
          Skills
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
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="label-label-1-regular bg-accent-primary text-accent-primary break-words px-3 py-1 rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)]"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
