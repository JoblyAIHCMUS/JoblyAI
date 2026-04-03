'use client';
import React from 'react';

export default function AboutMe({ about }: { about: string[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-4 sm:p-6 flex flex-col gap-4 w-full min-w-0">
      <div className="heading-h5-semi-bold text-[#0F172A] mb-2">About Me</div>
      {about.map((line, idx) => (
        <div
          key={idx}
          className="body-body-1-regular text-[#0F172A] break-words"
        >
          {line}
        </div>
      ))}
    </div>
  );
}
