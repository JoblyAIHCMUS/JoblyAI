'use client';
import React from 'react';

export default function Experiences({ experiences }: { experiences: any[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white px-2 sm:px-4 py-4 sm:py-6 flex flex-col gap-4 w-full min-w-0">
      <div className="text-xl font-semibold text-[#25324B] font-['Epilogue'] px-2 sm:px-4 mb-2">
        Experiences
      </div>
      {experiences.map((exp, idx) => (
        <div
          key={idx}
          className="flex flex-col md:flex-row gap-3 md:gap-6 px-2 sm:px-4 py-3 sm:py-4 min-w-0"
        >
          <img
            src={exp.logo}
            alt={exp.company}
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg object-cover mx-auto md:mx-0 shrink-0"
          />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="text-lg font-semibold text-[#0F172A] font-['Lexend_Deca']">
              {exp.role}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-base text-[#475569] font-normal min-w-0">
              <span className="truncate max-w-[40vw] md:max-w-[20vw]">
                {exp.company}
              </span>
              <span className="w-1 h-1 bg-[#A8ADB7] rounded-full inline-block"></span>
              <span>{exp.type}</span>
              <span className="w-1 h-1 bg-[#A8ADB7] rounded-full inline-block"></span>
              <span>{exp.time}</span>
            </div>
            <div className="text-[#64748B] text-base">{exp.location}</div>
            <div className="text-[#475569] text-base break-words">
              {exp.desc}
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-2 sm:px-4">
        <span className="text-[#4338CA] font-semibold cursor-pointer">
          Show 3 more experiences
        </span>
      </div>
    </div>
  );
}
