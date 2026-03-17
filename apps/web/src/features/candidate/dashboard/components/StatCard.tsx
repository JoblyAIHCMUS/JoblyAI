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
    <div className="overflow-hidden rounded-[10px] border border-[#d6ddeb] bg-white p-6">
      <div className="flex flex-col gap-7">
        <p className="font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-6 text-[#25324b]">
          {label}
        </p>
        <div className="flex items-end justify-between gap-4">
          <p className="font-[family-name:var(--family-primary)] text-[64px] font-medium leading-[80px] tracking-[-0.8px] text-[#25324b]">
            {value}
          </p>
          <div className="shrink-0 text-[#26a4ff]/30">{icon}</div>
        </div>
      </div>
    </div>
  );
}
