"use client";
import React from "react";
import { Edit } from "lucide-react";

export default function Educations({ educations }: { educations: any[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white px-1 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between px-4">
        <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca']">Educations</div>
        <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
          <Edit size={20} />
        </button>
      </div>
      {educations.map((edu, idx) => (
        <div key={idx} className="flex flex-row gap-6 px-6 py-4">
          <img src={edu.logo} alt={edu.school} className="w-20 h-20 rounded-lg object-cover" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-[#0F172A] font-['Lexend_Deca']">{edu.school}</div>
              <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
                <Edit size={20} />
              </button>
            </div>
            <div className="text-base text-[#475569]">{edu.degree}</div>
            <div className="text-base text-[#475569]">{edu.time}</div>
            <div className="text-base text-[#0F172A]">{edu.desc}</div>
          </div>
        </div>
      ))}
      <div className="flex justify-end px-6">
        <span className="text-[#4338CA] font-semibold cursor-pointer">Show 2 more educations</span>
      </div>
    </div>
  );
}
