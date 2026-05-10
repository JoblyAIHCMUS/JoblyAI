'use client';

import { useEffect, useRef, useState } from 'react';
import { DateRangePicker } from './dateRangePicker';
import { toDateInputValue } from '@/lib/candidateDate';

interface ApplicationsHeaderProps {
  greeting: string;
  firstName: string;
  dateRangeLabel: string;
  selectedStartDate: string;
  selectedEndDate: string;
  setSelectedStartDate: (date: string) => void;
  setSelectedEndDate: (date: string) => void;
  activityRangeText: string;
}

export function ApplicationsHeader({
  greeting,
  firstName,
  dateRangeLabel,
  selectedStartDate,
  selectedEndDate,
  setSelectedStartDate,
  setSelectedEndDate,
  activityRangeText,
}: ApplicationsHeaderProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const datePickerRef = useRef<HTMLDivElement>(null);

  const isInvalidDateRange =
    !!draftStartDate && !!draftEndDate && draftStartDate > draftEndDate;

  useEffect(() => {
    if (!isDatePickerOpen) {
      return;
    }

    setDraftStartDate(selectedStartDate);
    setDraftEndDate(selectedEndDate);
  }, [isDatePickerOpen, selectedEndDate, selectedStartDate]);

  useEffect(() => {
    if (!isDatePickerOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const applyQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setDraftStartDate(toDateInputValue(start));
    setDraftEndDate(toDateInputValue(end));
  };

  return (
    <>
      <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="font-[family-name:var(--family-primary)] text-[26px] font-semibold leading-[32px] tracking-[-0.2px] text-[#25324b] sm:text-[32px] sm:leading-[38px]">
            {greeting}, {firstName}
          </h3>
          <p className="mt-2 text-sm leading-5 text-[#7c8493] sm:text-base sm:leading-6">
            {activityRangeText}
          </p>
        </div>

        <DateRangePicker
          dateRangeLabel={dateRangeLabel}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
          datePickerRef={datePickerRef}
          draftStartDate={draftStartDate}
          draftEndDate={draftEndDate}
          setDraftStartDate={setDraftStartDate}
          setDraftEndDate={setDraftEndDate}
          isInvalidDateRange={isInvalidDateRange}
          applyQuickRange={applyQuickRange}
          onClear={() => {
            setDraftStartDate('');
            setDraftEndDate('');
          }}
          onApply={() => {
            setSelectedStartDate(draftStartDate);
            setSelectedEndDate(draftEndDate);
            setIsDatePickerOpen(false);
          }}
        />
      </section>
    </>
  );
}
