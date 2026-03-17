import { CalendarDays } from 'lucide-react';
import type { KeyboardEvent, RefObject } from 'react';

export function DateRangePicker({
  dateRangeLabel,
  isDatePickerOpen,
  setIsDatePickerOpen,
  datePickerRef,
  draftStartDate,
  draftEndDate,
  setDraftStartDate,
  setDraftEndDate,
  isInvalidDateRange,
  applyQuickRange,
  onClear,
  onApply,
}: {
  dateRangeLabel: string;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  datePickerRef: RefObject<HTMLDivElement | null>;
  draftStartDate: string;
  draftEndDate: string;
  setDraftStartDate: (value: string) => void;
  setDraftEndDate: (value: string) => void;
  isInvalidDateRange: boolean;
  applyQuickRange: (days: number) => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const handleDateInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || isInvalidDateRange) {
      return;
    }

    event.preventDefault();
    onApply();
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <button
        type="button"
        onClick={() => setIsDatePickerOpen((prev) => !prev)}
        className="inline-flex h-12 items-center gap-3 rounded-[6px] border border-[#d6ddeb] bg-white px-4 text-base font-medium text-[#515b6f]"
      >
        <span>{dateRangeLabel}</span>
        <CalendarDays className="h-4 w-4 text-[#4640de]" />
      </button>

      {isDatePickerOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#d6ddeb] bg-white shadow-[0_20px_50px_rgba(37,50,75,0.16)] xl:left-auto xl:right-0 xl:w-[340px]">
          <div className="bg-[linear-gradient(180deg,#f7f8ff_0%,#ffffff_100%)] px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-[family-name:var(--family-primary)] text-base font-semibold text-[#25324b]">
                  Filter by date range
                </p>
                <p className="mt-1 text-xs text-[#7c8493]">
                  Choose a period to narrow your applications
                </p>
              </div>
              <CalendarDays className="h-4 w-4 text-[#4640de]" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyQuickRange(1)}
                className="rounded-full border border-[#d6ddeb] bg-white px-3 py-1 text-xs font-medium text-[#515b6f] hover:border-[#c7cdf0] hover:text-[#25324b]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange(7)}
                className="rounded-full border border-[#d6ddeb] bg-white px-3 py-1 text-xs font-medium text-[#515b6f] hover:border-[#c7cdf0] hover:text-[#25324b]"
              >
                Last 7 days
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange(30)}
                className="rounded-full border border-[#d6ddeb] bg-white px-3 py-1 text-xs font-medium text-[#515b6f] hover:border-[#c7cdf0] hover:text-[#25324b]"
              >
                Last 30 days
              </button>
            </div>
          </div>

          <div className="space-y-3 px-5 py-4">
            <label className="block rounded-xl border border-[#e7ebf3] bg-[#fafbff] p-3 text-sm font-medium text-[#25324b]">
              From
              <input
                type="date"
                value={draftStartDate}
                onChange={(event) => setDraftStartDate(event.target.value)}
                onKeyDown={handleDateInputKeyDown}
                max={draftEndDate || undefined}
                className="mt-2 w-full rounded-md border border-[#d6ddeb] bg-white px-3 py-2 text-sm text-[#25324b] focus:border-[#4640de] focus:outline-none"
              />
            </label>

            <label className="block rounded-xl border border-[#e7ebf3] bg-[#fafbff] p-3 text-sm font-medium text-[#25324b]">
              To
              <input
                type="date"
                value={draftEndDate}
                onChange={(event) => setDraftEndDate(event.target.value)}
                onKeyDown={handleDateInputKeyDown}
                min={draftStartDate || undefined}
                className="mt-2 w-full rounded-md border border-[#d6ddeb] bg-white px-3 py-2 text-sm text-[#25324b] focus:border-[#4640de] focus:outline-none"
              />
            </label>

            {isInvalidDateRange && (
              <p className="text-xs text-[#ff6550]">
                Start date must be earlier than or equal to end date.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#eef1f6] px-5 py-4">
            <button
              type="button"
              onClick={onClear}
              className="rounded-md border border-[#d6ddeb] px-3 py-1.5 text-sm font-medium text-[#515b6f] hover:bg-[#f8fafc]"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={onApply}
              disabled={isInvalidDateRange}
              className="rounded-md bg-[#4640de] px-4 py-1.5 text-sm font-medium text-white transition-colors enabled:hover:bg-[#3530c8] disabled:cursor-not-allowed disabled:bg-[#c7cdf0]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
