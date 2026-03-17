import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[#d6ddeb] bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-5 sm:gap-7">
        <p className="font-[family-name:var(--family-primary)] text-lg font-semibold leading-6 text-[#25324b] sm:text-[20px]">
          {label}
        </p>
        <div className="flex items-end justify-between gap-4">
          <p className="font-[family-name:var(--family-primary)] text-[44px] font-medium leading-[56px] tracking-[-0.6px] text-[#25324b] sm:text-[64px] sm:leading-[80px] sm:tracking-[-0.8px]">
            {value}
          </p>
          <div className="shrink-0 text-[#26a4ff]/30">{icon}</div>
        </div>
      </div>
    </div>
  );
}
