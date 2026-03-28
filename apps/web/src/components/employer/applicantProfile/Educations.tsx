'use client';
import React from 'react';

export default function Educations({ educations }: { educations: any[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white px-2 sm:px-4 py-4 sm:py-6 flex flex-col gap-4 w-full min-w-0">
      <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca'] px-2 sm:px-4 mb-2">
        Educations
      </div>
      {educations.map((edu, idx) => (
        <div
          key={idx}
          className="flex flex-col md:flex-row gap-3 md:gap-6 px-2 sm:px-4 py-3 sm:py-4 min-w-0"
        >
          <img
            src={edu.logo}
            alt={edu.school}
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover mx-auto md:mx-0 shrink-0"
          />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="text-lg font-semibold text-[#0F172A] font-['Lexend_Deca']">
              {edu.school}
            </div>
            <div className="text-base text-[#475569]">{edu.degree}</div>
            <div className="text-base text-[#475569]">{edu.time}</div>
            <div className="text-base text-[#0F172A] break-words">
              {edu.desc}
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-2 sm:px-4">
        <span className="text-[#4338CA] font-semibold cursor-pointer">
          Show 2 more educations
        </span>
      </div>
    </div>
  );
}
