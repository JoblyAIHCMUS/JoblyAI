import { KeyboardEvent, useEffect, useMemo, useState } from 'react';

import { formatDateRangeLabel } from '@/lib/candidateDate';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/candidateStatus';
import { candidateDashboardService } from '@/services/candidateDashboardService';

import {
  FilterDraft,
  StatusTab,
  UseApplicationsPageStateParams,
} from '../types';

function buildFilterDraft(
  applicationFilter: UseApplicationsPageStateParams['applicationFilter'],
  advancedFilters: UseApplicationsPageStateParams['advancedFilters']
): FilterDraft {
  return {
    status: applicationFilter,
    company: advancedFilters.company,
    jobType: advancedFilters.jobType,
    location: advancedFilters.location,
  };
}

export function useApplicationsPageState({
  applications,
  applicationFilter,
  setApplicationFilter,
  selectedStartDate,
  selectedEndDate,
  advancedFilters,
  applyAdvancedFilters,
  clearAdvancedFilters,
  applySearch,
  currentPage,
  totalPages,
}: UseApplicationsPageStateParams) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(() =>
    buildFilterDraft(applicationFilter, advancedFilters)
  );

  useEffect(() => {
    if (!isFilterDialogOpen) {
      return;
    }

    setFilterDraft(buildFilterDraft(applicationFilter, advancedFilters));
  }, [
    applicationFilter,
    advancedFilters,
    isFilterDialogOpen,
  ]);

  const dateRangeLabel = formatDateRangeLabel(selectedStartDate, selectedEndDate);
  const activityStatusText =
    dateRangeLabel === 'Select date range'
      ? 'from all time'
      : `from ${dateRangeLabel}`;
  const activityRangeText =
    `Here is job applications status ${activityStatusText}.`;

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

  return {
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    filterDraft,
    setFilterDraft,
    dateRangeLabel,
    activityRangeText,
    tabs,
    visiblePages,
    handleSearchSubmit,
    handleSearchKeyDown,
    handleApplyFilters,
    handleClearFilters,
  };
}
