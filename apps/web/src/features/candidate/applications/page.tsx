'use client';

import { KeyboardEvent, useEffect, useMemo, useState } from 'react';

import { ApplicationTable } from '@/components/candidate/applicationTable';
import { ApplicationHistoryRow } from '@/components/candidate/applicationHistoryRow';
import { ApplicationsHeader } from '@/components/candidate/applicationsHeader';
import { ApplicationStatusTabs } from '@/features/candidate/applications/components/ApplicationStatusTabs';
import { ApplicationsFeatureNotice } from '@/features/candidate/applications/components/ApplicationsFeatureNotice';
import { ApplicationsFilterDialog } from '@/features/candidate/applications/components/ApplicationsFilterDialog';
import { ApplicationsSearchToolbar } from '@/features/candidate/applications/components/ApplicationsSearchToolbar';
import {
  FilterDraft,
  StatusTab,
} from '@/features/candidate/applications/components/types';
import { useUser } from '@/hooks/useUser';
import { useCandidateDashboard } from '@/features/candidate/hook/useCandidateDashboard';
import {
  formatDateRangeLabel,
} from '@/lib/candidateDate';
import { candidateDashboardService } from '@/services/candidateDashboardService';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/candidateStatus';

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
    searchQuery,
    setSearchQuery,
    applySearch,
    isSearching,
    advancedFilters,
    applyAdvancedFilters,
    clearAdvancedFilters,
    activeAdvancedFilterCount,
    companyOptions,
    jobTypeOptions,
    locationOptions,
  } = useCandidateDashboard();

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>({
    status: applicationFilter,
    company: advancedFilters.company,
    jobType: advancedFilters.jobType,
    location: advancedFilters.location,
  });

  useEffect(() => {
    if (!isFilterDialogOpen) {
      return;
    }

    setFilterDraft({
      status: applicationFilter,
      company: advancedFilters.company,
      jobType: advancedFilters.jobType,
      location: advancedFilters.location,
    });
  }, [
    applicationFilter,
    advancedFilters.company,
    advancedFilters.jobType,
    advancedFilters.location,
    isFilterDialogOpen,
  ]);

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

  const handleSearchSubmit = () => {
    // TODO(real-api): Keep this trigger; only swap implementation in hook/service.
    applySearch();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applySearch();
    }
  };

  const handleApplyFilters = () => {
    // TODO(real-api): When backend adds server-side filter params, this handler can stay unchanged.
    setApplicationFilter(filterDraft.status);
    applyAdvancedFilters({
      company: filterDraft.company,
      jobType: filterDraft.jobType,
      location: filterDraft.location,
    });
    setIsFilterDialogOpen(false);
  };

  const handleClearFilters = () => {
    // TODO(real-api): If filter state is synced to URL/query params, clear them here too.
    clearAdvancedFilters();
    setFilterDraft({
      status: 'all',
      company: '',
      jobType: '',
      location: '',
    });
    setIsFilterDialogOpen(false);
  };

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

        <ApplicationsFeatureNotice />

        <ApplicationStatusTabs
          tabs={tabs}
          activeFilter={applicationFilter}
          onChangeFilter={setApplicationFilter}
        />

        <section className="rounded-none bg-white">
          <ApplicationsSearchToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            onSearchKeyDown={handleSearchKeyDown}
            isSearching={isSearching}
            activeAdvancedFilterCount={activeAdvancedFilterCount}
            onOpenFilter={() => setIsFilterDialogOpen(true)}
          />

          <ApplicationsFilterDialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
            filterDraft={filterDraft}
            setFilterDraft={setFilterDraft}
            companyOptions={companyOptions}
            jobTypeOptions={jobTypeOptions}
            locationOptions={locationOptions}
            dateRangeLabel={dateRangeLabel}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />

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
