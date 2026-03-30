'use client';
import React from 'react';
import { Edit } from 'lucide-react';

export default function Educations({ educations }: { educations: any[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] px-[var(--space-xs2)] py-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Educations
        </div>
        <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
          <Edit size={20} className="text-accent-primary" />
        </button>
      </div>
      {educations.map((edu, idx) => (
        <div key={idx} className="flex flex-row gap-6 px-6 py-4">
          <img
            src={edu.logo}
            alt={edu.school}
            className="w-20 h-20 rounded-[var(--radius-xl)] object-cover"
          />
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="heading-h6-semi-bold text-primary break-words">
                {edu.school}
              </div>
              <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
                <Edit size={20} className="text-accent-primary" />
              </button>
            </div>
            <div className="body-body-1-regular text-secondary break-words">{edu.degree}</div>
            <div className="body-body-1-regular text-secondary break-words">{edu.time}</div>
            <div className="body-body-1-regular text-primary break-words">{edu.desc}</div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-6">
        <span className="label-label-1-semi-bold text-accent-primary cursor-pointer break-words">
          Show 2 more educations
        </span>
      </div>
    </div>
  );
}
