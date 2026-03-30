'use client';
import React from 'react';
import { Edit, Dot } from 'lucide-react';

export default function Experiences({ experiences }: { experiences: any[] }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] px-[var(--space-xs2)] py-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
      <div className="flex items-center justify-between px-4">
        <div className="heading-h6-semi-bold text-primary break-words">
          Experiences
        </div>
        <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
          <Edit size={20} className='text-accent-primary'/>
        </button>
      </div>
      {experiences.map((exp, idx) => (
        <div key={idx} className="flex flex-row gap-6 px-6 py-4">
          <img
            src={exp.logo}
            alt={exp.company}
            className="w-20 h-20 rounded-[var(--radius-xl)] object-cover"
          />
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="heading-h6-semi-bold text-primary break-words ">
                {exp.role}
              </div>
              <button className="p-[var(--space-xs)] rounded-[var(--radius-md)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] hover:bg-[color:var(--bg-tertiary)]">
                <Edit size={20} className="text-accent-primary" />
              </button>
            </div>
            <div className="flex items-center gap-[var(--space-xs)]">
              <span className='body-body-1-medium text-primary break-words'>{exp.company}</span>
              <Dot size={16} />
              <span className="body-body-1-regular text-secondary break-words">{exp.type}</span>
              <Dot size={16} />
              <span className="body-body-1-regular text-secondary break-words">{exp.time}</span>
            </div>
            <div className="text-tertiary break-words">{exp.location}</div>
            <div className="text-secondary break-words">{exp.desc}</div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-6">
        <span className="label-label-1-semi-bold text-accent-primary cursor-pointer break-words">
          Show 3 more experiences
        </span>
      </div>
    </div>
  );
}
