"use client";
import React from "react";
import { Edit } from "lucide-react";

export default function Experiences({ experiences }: { experiences: any[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white px-1 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between px-4">
        <div className="text-xl font-semibold text-[#25324B] font-['Epilogue']">Experiences</div>
        <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
          <Edit size={20} />
        </button>
      </div>
      {experiences.map((exp, idx) => (
        <div key={idx} className="flex flex-row gap-6 px-6 py-4">
          <img src={exp.logo} alt={exp.company} className="w-20 h-20 rounded-lg object-cover" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-[#0F172A] font-['Lexend_Deca']">{exp.role}</div>
              <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
                <Edit size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-base text-[#475569] font-normal">
              <span>{exp.company}</span>
              <span className="w-1 h-1 bg-[#A8ADB7] rounded-full inline-block"></span>
              <span>{exp.type}</span>
              <span className="w-1 h-1 bg-[#A8ADB7] rounded-full inline-block"></span>
              <span>{exp.time}</span>
            </div>
            <div className="text-[#64748B] text-base">{exp.location}</div>
            <div className="text-[#475569] text-base">{exp.desc}</div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-6">
        <span className="text-[#4338CA] font-semibold cursor-pointer">Show 3 more experiences</span>
      </div>
    </div>
  );
}
