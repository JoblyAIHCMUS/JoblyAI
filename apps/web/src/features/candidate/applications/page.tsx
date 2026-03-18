'use client';

import { useMemo } from 'react';
import {
  CalendarDays,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { ApplicationTable } from '@/components/candidate/applicationTable';
import { ApplicationHistoryRow } from '@/components/candidate/applicationHistoryRow';
import { ApplicationsHeader } from '@/components/candidate/applicationsHeader';
import { useUser } from '@/hooks/useUser';
import { useCandidateDashboard } from '@/features/candidate/hook/useCandidateDashboard';
import {
  formatDateRangeLabel,
} from '@/lib/candidateDate';
import { candidateDashboardService } from '@/services/candidateDashboardService';
import {
  ApplicationFilter,
} from '@/types/candidate';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/candidateStatus';

type StatusTab = {
  key: ApplicationFilter;
  label: string;
  count: number;
};

export default function CandidateApplicationsPage() {
  const { data: user } = useUser();
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

  const dateRangeLabel = formatDateRangeLabel(selectedStartDate, selectedEndDate);
  const firstName = user?.name?.split(' ')[0] ?? 'Jake';
  const activityStatusText = dateRangeLabel === 'Select date range' ? 'from all time' : `from ${dateRangeLabel}`;
  const activityRangeText = `Here is job applications status ${activityStatusText}.`;

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

  return (
    <div className="min-h-full bg-white">
      <div className="flex flex-col gap-6 px-4 py-5 sm:gap-8 sm:py-6 md:px-8 md:py-6">

        <ApplicationsHeader
          greeting="Keep it up"
          firstName={firstName}
          dateRangeLabel={dateRangeLabel}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          setSelectedStartDate={setSelectedStartDate}
          setSelectedEndDate={setSelectedEndDate}
          activityRangeText={activityRangeText}
        />

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

          <ApplicationTable
            filteredApplications={filteredApplications}
            paginatedApplications={paginatedApplications}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            statusMeta={statusMeta}
            visiblePages={visiblePages}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            goToPage={goToPage}
            renderRow={(item, index, tinted, statusMeta) => (
              <ApplicationHistoryRow
                key={item.id}
                item={item}
                index={index}
                tinted={tinted}
                statusMeta={statusMeta}
              />
            )}
          />
        </section>
      </div>
    </div>
  );
}
