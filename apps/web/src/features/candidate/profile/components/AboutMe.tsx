"use client";
import React from "react";
import { Edit } from "lucide-react";

export default function AboutMe({ about }: { about: string[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca']">About Me</div>
        <button className="p-2 rounded-[5px] border border-[#D6DDEB] bg-white hover:bg-gray-50">
          <Edit size={20} />
        </button>
      </div>
      {about.map((line, idx) => (
        <div key={idx} className="text-base text-[#0F172A] font-normal font-['Be_Vietnam_Pro'] leading-6">{line}</div>
      ))}
    </div>
  );
}
