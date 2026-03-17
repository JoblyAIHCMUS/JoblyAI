'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { ApplicationStatusPill } from '@/components/candidate/applicationStatusPill';
import { DateRangePicker } from '@/components/candidate/dateRangePicker';
import { useUser } from '@/hooks/useUser';
import { useCandidateDashboard } from '@/hooks/useCandidateDashboard';
import {
  formatCreatedAtForDisplay,
  formatDateRangeLabel,
  toDateInputValue,
} from '@/lib/candidateDate';
import { candidateDashboardService } from '@/services/candidateDashboardService';
import {
  ApplicationFilter,
  ApplicationItem,
  ApplicationStatusMeta,
} from '@/types/candidate';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/candidateStatus';
import { getInitials } from '@/lib/utils';

type StatusTab = {
  key: ApplicationFilter;
  label: string;
  count: number;
};

function ApplicationHistoryRow({
  item,
  index,
  tinted,
  statusMeta,
}: {
  item: ApplicationItem;
  index: number;
  tinted: boolean;
  statusMeta: ApplicationStatusMeta;
}) {
  const initials = getInitials(item.company);
  const displayCreatedAt = formatCreatedAtForDisplay(item.createdAt);

  return (
    <div
      className={`rounded-[2px] px-4 py-4 lg:px-6 ${
        tinted ? 'bg-[#f8f8fd]' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[12px] text-sm font-semibold text-white"
            style={{ backgroundColor: item.accent }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[#25324b]">
              {item.company}
            </p>
            <p className="truncate text-sm text-[#7c8493]">{item.title}</p>
          </div>
        </div>
        <ApplicationStatusPill
          status={item.status}
          statusMeta={statusMeta}
          compact
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-[#7c8493] lg:hidden">
        <span>#{index}</span>
        <span>{displayCreatedAt}</span>
      </div>

      <div className="hidden items-center gap-5 lg:grid lg:grid-cols-[56px_221px_275px_194px_1fr_24px]">
        <p className="text-base text-[#25324b]">{index}</p>

        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-sm font-semibold text-white"
            style={{ backgroundColor: item.accent }}
          >
            {initials}
          </div>
          <p className="truncate text-base font-medium text-[#25324b]">
            {item.company}
          </p>
        </div>

        <p className="truncate text-base text-[#25324b]">{item.title}</p>
        <p className="text-base text-[#25324b]">{displayCreatedAt}</p>

        <div>
          <ApplicationStatusPill
            status={item.status}
            statusMeta={statusMeta}
            compact
          />
        </div>

        <button
          type="button"
          aria-label={`More actions for ${item.company}`}
          className="flex h-6 w-6 items-center justify-center text-[#25324b]"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function CandidateApplicationsPage() {
  const { data: user } = useUser();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const datePickerRef = useRef<HTMLDivElement>(null);
  const {
    applications,
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
    pageSize,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    statusMeta,
  } = useCandidateDashboard();

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

  const dateRangeLabel = formatDateRangeLabel(selectedStartDate, selectedEndDate);
  const firstName = user?.name?.split(' ')[0] ?? 'Jake';

  const applicationsInDateRange = useMemo(() => {
    return candidateDashboardService.filterApplicationsByDate(
      applications,
      selectedStartDate,
      selectedEndDate
    );
  }, [applications, selectedStartDate, selectedEndDate]);

  const tabs: StatusTab[] = useMemo(() => {
    const activeCount = applicationsInDateRange.filter((item) =>
      isActiveApplicationStatus(item.status)
    ).length;
    const closedCount = applicationsInDateRange.filter((item) =>
      isClosedApplicationStatus(item.status)
    ).length;

    return [
      { key: 'all', label: 'All', count: applicationsInDateRange.length },
      { key: 'active', label: 'In Review', count: activeCount },
      { key: 'closed', label: 'Offered', count: closedCount },
    ];
  }, [applicationsInDateRange]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  const isInvalidDateRange =
    !!draftStartDate && !!draftEndDate && draftStartDate > draftEndDate;

  return (
    <div className="min-h-full bg-white">
      <div className="flex flex-col gap-6 px-4 py-5 sm:gap-8 sm:py-6 md:px-8 md:py-6">
        <section className="flex items-center justify-between border-b border-[#d6ddeb] pb-5">
          <h2 className="font-[family-name:var(--family-primary)] text-[30px] font-semibold leading-[38px] tracking-[-0.15px] text-[#25324b]">
            My Applications
          </h2>
        </section>

        <section className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="font-[family-name:var(--family-primary)] text-[32px] font-semibold leading-[38px] tracking-[-0.2px] text-[#25324b]">
              Keep it up, {firstName}
            </h3>
            <p className="mt-2 text-base leading-6 text-[#7c8493]">
              Here is job applications status {dateRangeLabel === 'Select date range' ? 'from all time' : `from ${dateRangeLabel}` }.
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
                  You can request a follow-up 7 days after applying for a job if the application status is in review. Only one follow-up is allowed per job.
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

        <section>
          <div className="flex flex-wrap items-center gap-6 border-b border-[#d6ddeb]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setApplicationFilter(tab.key)}
                className={`border-b-2 px-1 pb-2 pt-1 text-base font-medium ${
                  applicationFilter === tab.key
                    ? 'border-[#4640de] text-[#4640de]'
                    : 'border-transparent text-[#515b6f]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-none bg-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-[family-name:var(--family-primary)] text-[32px] font-semibold leading-[38px] tracking-[-0.2px] text-[#25324b]">
              Applications History
            </p>

            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#d6ddeb] bg-white px-4 py-2 text-base text-[#25324b]"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-[#d6ddeb] bg-white px-4 py-2 text-base text-[#25324b]"
              >
                <SlidersHorizontal className="h-5 w-5" />
                Filter
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-4 lg:gap-0">
            {filteredApplications.length > 0 && (
              <div className="hidden items-center gap-5 border-b border-[#eef1f6] px-6 py-3 text-sm font-medium text-[#7c8493] lg:grid lg:grid-cols-[56px_minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(150px,0.7fr)_117px_24px]">
                <p>#</p>
                <p>Company Name</p>
                <p>Roles</p>
                <p>Date Applied</p>
                <p>Status</p>
                <p className="text-right">Actions</p>
              </div>
            )}

            {paginatedApplications.map((item, index) => (
              <ApplicationHistoryRow
                key={item.id}
                item={item}
                index={(currentPage - 1) * pageSize + index + 1}
                tinted={index % 2 === 1}
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
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d6ddeb] text-[#515b6f] disabled:opacity-40"
                aria-label="Previous page"
              >
                {'<'}
              </button>

              {visiblePages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ${
                    page === currentPage
                      ? 'bg-[#4640de] text-white'
                      : 'text-[#515b6f] hover:bg-[#f8fafc]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d6ddeb] text-[#515b6f] disabled:opacity-40"
                aria-label="Next page"
              >
                {'>'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
