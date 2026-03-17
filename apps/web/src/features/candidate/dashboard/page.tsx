'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight, FileText, MessageCircleQuestion } from 'lucide-react';

import { useUser } from '@/hooks/useUser';
import { ApplicationFilter } from './types';
import { useCandidateDashboard } from '../../../hooks/useCandidateDashboard';
import { ApplicationRow } from './components/ApplicationRow';
import { DateRangePicker } from './components/DateRangePicker';
import { StatCard } from './components/StatCard';
import { StatusChartsSection } from './components/StatusChartsSection';
import { useDashboardInsights } from './hooks/useDashboardInsights';
import {
  formatDateRangeLabel,
  getGreeting,
  toDateInputValue,
} from './utils/dashboardFormatters';

export default function CandidateDashboardPage() {
  const { data: user } = useUser();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const datePickerRef = useRef<HTMLDivElement>(null);
  const {
    applicationFilter,
    setApplicationFilter,
    selectedStartDate,
    selectedEndDate,
    setSelectedStartDate,
    setSelectedEndDate,
    filteredApplications,
    paginatedApplications,
    currentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
    statusMeta,
    filterMeta,
  } = useCandidateDashboard();

  const firstName = user?.name?.split(' ')[0] ?? 'Jake';
  const greeting = getGreeting();
  const dateRangeLabel = formatDateRangeLabel(selectedStartDate, selectedEndDate);
  const activityRangeText =
    dateRangeLabel === 'Select date range' ? 'from all time' : `from ${dateRangeLabel}`;
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

  const { barChartItems, pieChartItems, pieChartBackground, interviewedCount } =
    useDashboardInsights({
      filteredApplications,
      selectedStartDate,
      selectedEndDate,
      statusMeta,
    });

  return (
    <div className="min-h-full bg-white">
      <div className="flex flex-col gap-8 px-4 py-6 md:px-8 md:py-6">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="font-[family-name:var(--family-primary)] text-[32px] font-semibold leading-[38px] tracking-[-0.2px] text-[#25324b]">
              {greeting}, {firstName}
            </h2>
            <p className="mt-2 max-w-3xl text-base leading-6 text-[#7c8493]">
              Here is what&apos;s happening with your job search applications{' '}
              {activityRangeText}.
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

        <section className="grid gap-6 xl:grid-cols-[258px_1fr]">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard
              label="Total Jobs Applied"
              value={pieChartItems.total}
              icon={<FileText className="h-28 w-28" strokeWidth={1.4} />}
            />
            <StatCard
              label="Interviewed"
              value={interviewedCount}
              icon={<MessageCircleQuestion className="h-28 w-28" strokeWidth={1.4} />}
            />
          </div>

          <StatusChartsSection
            barChartItems={barChartItems}
            pieChartItems={pieChartItems}
            pieChartBackground={pieChartBackground}
          />
        </section>

        <section
          id="applications"
          className="rounded-none border border-[#d6ddeb] bg-white p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-6 text-[#25324b]">
              Recent Applications History
            </p>

            <div className="inline-flex w-full rounded-lg border border-[#d6ddeb] p-1 sm:w-auto">
              {(Object.keys(filterMeta) as ApplicationFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setApplicationFilter(filter)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none ${
                    applicationFilter === filter
                      ? 'bg-[#eef0ff] text-[#4640de]'
                      : 'text-[#7c8493] hover:text-[#25324b]'
                  }`}
                >
                  {filterMeta[filter].label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-7 h-px w-full bg-[#d6ddeb]" />

          <div className="mt-6 flex flex-col gap-4 lg:gap-0">
            {filteredApplications.length > 0 && (
              <div className="hidden items-center gap-5 border-b border-[#eef1f6] px-6 py-3 text-sm font-medium text-[#7c8493] lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(150px,0.7fr)_117px_24px]">
                <p>Job</p>
                <p>Date Applied</p>
                <p>Status</p>
                <p className="text-right">Actions</p>
              </div>
            )}

            {paginatedApplications.map((item, index) => (
              <ApplicationRow
                key={item.id}
                item={item}
                tinted={index % 2 === 0}
                statusMeta={statusMeta}
              />
            ))}

            {filteredApplications.length === 0 && (
              <div className="rounded-sm bg-[#f8fafc] px-6 py-10 text-center text-sm text-[#7c8493]">
                No applications found for this filter.
              </div>
            )}
          </div>

          {filteredApplications.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-[#7c8493]">
                Page {currentPage} of {totalPages}
              </p>

              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-md border border-[#d6ddeb] px-3 py-1.5 text-sm font-medium text-[#515b6f] transition-colors enabled:hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-[#d6ddeb] px-3 py-1.5 text-sm font-medium text-[#515b6f] transition-colors enabled:hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <Link
            href="/candidate/dashboard#applications"
            className="mt-8 inline-flex items-center gap-3 font-[family-name:var(--family-primary)] text-base font-semibold leading-[22px] text-[#4640de]"
          >
            View all applications history
            <ChevronRight className="h-5 w-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
