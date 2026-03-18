import { useMemo } from 'react';

import { formatDateRangeLabel } from '@/lib/candidateDate';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/candidateStatus';
import { candidateDashboardService } from '@/services/candidateDashboardService';
import {
  ApplicationFilter,
  ApplicationItem,
  CandidateApplicationsAdvancedFilter,
} from '@/types/candidate';

type UseCandidateApplicationsViewModelParams = {
  applicationFilter: ApplicationFilter;
  advancedFilters: CandidateApplicationsAdvancedFilter;
  applications: ApplicationItem[];
  selectedStartDate: string;
  selectedEndDate: string;
  currentPage: number;
  totalPages: number;
};

export function useCandidateApplicationsViewModel({
  applicationFilter,
  advancedFilters,
  applications,
  selectedStartDate,
  selectedEndDate,
  currentPage,
  totalPages,
}: UseCandidateApplicationsViewModelParams) {
  const activeAdvancedFilterCount = useMemo(() => {
    let count = 0;

    if (applicationFilter !== 'all') {
      count += 1;
    }
    if (advancedFilters.company) {
      count += 1;
    }
    if (advancedFilters.jobType) {
      count += 1;
    }
    if (advancedFilters.location) {
      count += 1;
    }

    return count;
  }, [advancedFilters, applicationFilter]);

  const dateRangeLabel = useMemo(() => {
    return formatDateRangeLabel(selectedStartDate, selectedEndDate);
  }, [selectedStartDate, selectedEndDate]);

  const applicationsInDateRange = useMemo(() => {
    return candidateDashboardService.filterApplicationsByDate(
      applications,
      selectedStartDate,
      selectedEndDate
    );
  }, [applications, selectedStartDate, selectedEndDate]);

  const tabs = useMemo(
    (): Array<{ key: ApplicationFilter; label: string; count: number }> => {
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
    },
    [applicationsInDateRange]
  );

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  return {
    activeAdvancedFilterCount,
    dateRangeLabel,
    tabs,
    visiblePages,
  };
}
