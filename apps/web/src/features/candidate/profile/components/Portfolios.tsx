"use client";
import React from "react";
import { Edit } from "lucide-react";

export default function Portfolios({ portfolios }: { portfolios: any[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white px-4 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca']">Portfolios</div>
        <button className="p-2 rounded-[5px] border border-[#CBD5E1] bg-white hover:bg-gray-50">
          <Edit size={20} />
        </button>
      </div>
      <div className="flex flex-row gap-4 overflow-x-auto">
        {portfolios.map((p, idx) => (
          <div key={idx} className="flex flex-col gap-2 min-w-[203px]">
            <img src={p.img} alt={p.name} className="w-[203px] h-[152px] rounded-lg object-cover" />
            <div className="text-base font-medium text-[#0F172A] font-['Lexend_Deca']">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
