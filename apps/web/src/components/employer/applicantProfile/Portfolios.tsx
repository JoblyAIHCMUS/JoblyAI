'use client';
import React from 'react';

export default function Portfolios({ portfolios }: { portfolios: any[] }) {
  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white px-4 py-6 flex flex-col gap-4 w-full">
      <div className="heading-h5-semi-bold text-[#0F172A] mb-2">Portfolios</div>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {portfolios.map((p, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-[152px] rounded-lg object-cover"
              />
              <div className="body-body-1-medium text-[#0F172A]">{p.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
