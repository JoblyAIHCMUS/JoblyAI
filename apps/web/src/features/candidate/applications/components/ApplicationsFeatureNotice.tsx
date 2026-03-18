'use client';

import { CalendarDays, X } from 'lucide-react';

export function ApplicationsFeatureNotice() {
  return (
    <section className="rounded-[10px] border border-[#d6ddeb] bg-[#f8f8fd] px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9ebfd] text-[#4640de]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="font-[family-name:var(--family-primary)] text-[28px] font-semibold leading-8 text-[#4640de]">
              New Feature
            </p>
            <p className="mt-1 text-base leading-6 text-[#515b6f]">
              You can request a follow-up 7 days after applying for a job if the
              application status is in review. Only one follow-up is allowed per
              job.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss update"
          className="text-[#25324b]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
