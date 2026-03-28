'use client';
import React from 'react';

export default function AboutMe({ about }: { about: string[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-4 sm:p-6 flex flex-col gap-4 w-full min-w-0">
      <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca'] mb-2">
        About Me
      </div>
      {about.map((line, idx) => (
        <div
          key={idx}
          className="text-base text-[#0F172A] font-normal font-['Be_Vietnam_Pro'] leading-6 break-words"
        >
          {line}
        </div>
      ))}
    </div>
  );
}
