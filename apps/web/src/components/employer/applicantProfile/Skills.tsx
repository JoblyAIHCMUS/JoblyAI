'use client';
import React from 'react';

export default function Skills({ skills }: { skills: string[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-4 sm:p-6 flex flex-col gap-4 w-full min-w-0">
      <div className="heading-h5-semi-bold text-[#0F172A] mb-2">Skills</div>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-[#EEF2FF] rounded text-[#4338CA] label-label-1-semi-bold break-words"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
