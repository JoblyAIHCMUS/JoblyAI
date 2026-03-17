import { CalendarDays } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type RefObject,
} from 'react';

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstDateInputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const panelTitleId = useId();
  const wasOpenRef = useRef(isDatePickerOpen);

  useEffect(() => {
    if (isDatePickerOpen) {
      firstDateInputRef.current?.focus();
    } else if (wasOpenRef.current) {
      triggerRef.current?.focus();
    }

    wasOpenRef.current = isDatePickerOpen;
  }, [isDatePickerOpen]);

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') {
      return;
    }

    event.preventDefault();
    setIsDatePickerOpen(false);
  };

  return (
    <div className="relative" ref={datePickerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsDatePickerOpen((prev) => !prev)}
        aria-expanded={isDatePickerOpen}
        aria-haspopup="dialog"
        aria-controls={panelId}
        className="inline-flex h-10 items-center gap-2.5 rounded-[6px] border border-[#d6ddeb] bg-white px-3 text-sm font-medium text-[#515b6f] sm:h-12 sm:gap-3 sm:px-4 sm:text-base"
      >
        <span>{dateRangeLabel}</span>
        <CalendarDays className="h-4 w-4 text-[#4640de]" />
      </button>

      {isDatePickerOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={panelTitleId}
          onKeyDown={handlePanelKeyDown}
          className="absolute left-0 top-full z-20 mt-2 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#d6ddeb] bg-white shadow-[0_20px_50px_rgba(37,50,75,0.16)] xl:left-auto xl:right-0 xl:w-[340px]"
        >
          <div className="bg-[linear-gradient(180deg,#f7f8ff_0%,#ffffff_100%)] px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id={panelTitleId}
                  className="font-[family-name:var(--family-primary)] text-sm font-semibold text-[#25324b] sm:text-base"
                >
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
                className="rounded-full border border-[#d6ddeb] bg-white px-3 py-1 text-[11px] font-medium text-[#515b6f] hover:border-[#c7cdf0] hover:text-[#25324b] sm:text-xs"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange(7)}
                className="rounded-full border border-[#d6ddeb] bg-white px-3 py-1 text-[11px] font-medium text-[#515b6f] hover:border-[#c7cdf0] hover:text-[#25324b] sm:text-xs"
              >
                Last 7 days
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange(30)}
                className="rounded-full border border-[#d6ddeb] bg-white px-3 py-1 text-[11px] font-medium text-[#515b6f] hover:border-[#c7cdf0] hover:text-[#25324b] sm:text-xs"
              >
                Last 30 days
              </button>
            </div>
          </div>

          <div className="space-y-3 px-5 py-4">
            <label className="block rounded-xl border border-[#e7ebf3] bg-[#fafbff] p-3 text-xs font-medium text-[#25324b] sm:text-sm">
              From
              <input
                ref={firstDateInputRef}
                type="date"
                value={draftStartDate}
                onChange={(event) => setDraftStartDate(event.target.value)}
                max={draftEndDate || undefined}
                className="mt-2 w-full rounded-md border border-[#d6ddeb] bg-white px-3 py-2 text-xs text-[#25324b] focus:border-[#4640de] focus:outline-none sm:text-sm"
              />
            </label>

            <label className="block rounded-xl border border-[#e7ebf3] bg-[#fafbff] p-3 text-xs font-medium text-[#25324b] sm:text-sm">
              To
              <input
                type="date"
                value={draftEndDate}
                onChange={(event) => setDraftEndDate(event.target.value)}
                min={draftStartDate || undefined}
                className="mt-2 w-full rounded-md border border-[#d6ddeb] bg-white px-3 py-2 text-xs text-[#25324b] focus:border-[#4640de] focus:outline-none sm:text-sm"
              />
            </label>

            {isInvalidDateRange && (
              <p className="text-xs text-[#ff6550]">
                Start date must be earlier than or equal to end date.
              </p>
            )}
            <div className="-mx-5 flex items-center justify-between border-t border-[#eef1f6] px-5 pt-4">
              <button
                type="button"
                onClick={onClear}
                className="rounded-md border border-[#d6ddeb] px-3 py-1.5 text-xs font-medium text-[#515b6f] hover:bg-[#f8fafc] sm:text-sm"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={onApply}
                disabled={isInvalidDateRange}
                className="rounded-md bg-[#4640de] px-4 py-1.5 text-xs font-medium text-white transition-colors enabled:hover:bg-[#3530c8] disabled:cursor-not-allowed disabled:bg-[#c7cdf0] sm:text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
