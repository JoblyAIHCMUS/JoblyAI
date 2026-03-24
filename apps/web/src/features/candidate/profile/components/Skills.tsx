"use client";
import React from "react";
import { Edit, Plus } from "lucide-react";

export default function Skills({ skills }: { skills: string[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca']">Skills</div>
        <div className="flex gap-2">
          <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
            <Plus size={20}/>
          </button>
          <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
            <Edit size={20} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, idx) => (
          <span key={idx} className="px-3 py-1 bg-[#EEF2FF] rounded text-[#4338CA] text-base font-['Lexend_Deca']">{skill}</span>
        ))}
      </div>
    </div>
  );
}
