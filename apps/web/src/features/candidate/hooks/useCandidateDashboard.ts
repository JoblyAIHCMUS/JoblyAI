import { useEffect, useMemo, useState } from 'react';

import { formatDateRangeLabel } from '@/lib/candidateDate';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/candidateStatus';
import { candidateDashboardService } from '@/services/candidateDashboardService';
import {
  ApplicationFilter,
  CandidateApplicationsAdvancedFilter,
} from '@/types/candidate';
import { usePagination } from '@/hooks/usePagination';
import { useCandidate } from '@/features/candidate/context/candidate-context';

export function useCandidateDashboard() {
  const PAGE_SIZE = 10;
  // TODO(real-api): Replace initial local data with query cache state (SWR/React Query) if needed.
  const applications = candidateDashboardService.getApplications();
  const statusMeta = candidateDashboardService.getStatusMeta();
  const filterMeta = candidateDashboardService.getFilterMeta();
  const companyOptions = candidateDashboardService.getUniqueFilterOptions(
    applications,
    'company'
  );
  const jobTypeOptions = candidateDashboardService.getUniqueFilterOptions(
    applications,
    'jobType'
  );
  const locationOptions = candidateDashboardService.getUniqueFilterOptions(
    applications,
    'location'
  );

  const defaultAdvancedFilters: CandidateApplicationsAdvancedFilter = {
    company: '',
    jobType: '',
    location: '',
  };

  const {
    selectedStartDate,
    selectedEndDate,
    setSelectedStartDate,
    setSelectedEndDate,
  } = useCandidate();
  const [applicationFilter, setApplicationFilter] =
    useState<ApplicationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [advancedFilters, setAdvancedFilters] =
    useState<CandidateApplicationsAdvancedFilter>(defaultAdvancedFilters);
  const [filteredApplications, setFilteredApplications] =
    useState(applications);
  const [isSearching, setIsSearching] = useState(false);

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

  useEffect(() => {
    let isCancelled = false;

    const runSearch = async () => {
      // TODO(real-api): Handle API errors with toast/error-state when endpoint is connected.
      setIsSearching(true);

      try {
        const result = await candidateDashboardService.searchApplications({
          query: searchKeyword,
          status: applicationFilter,
          startDate: selectedStartDate,
          endDate: selectedEndDate,
          company: advancedFilters.company,
          jobType: advancedFilters.jobType,
          location: advancedFilters.location,
        });

        if (!isCancelled) {
          setFilteredApplications(result);
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    };

    void runSearch();

    return () => {
      isCancelled = true;
    };
  }, [
    applicationFilter,
    advancedFilters.company,
    advancedFilters.jobType,
    advancedFilters.location,
    searchKeyword,
    selectedStartDate,
    selectedEndDate,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / PAGE_SIZE)
  );
  const { currentPage, setCurrentPage, goPrev, goNext } =
    usePagination(totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    applicationFilter,
    advancedFilters.company,
    advancedFilters.jobType,
    advancedFilters.location,
    searchKeyword,
    selectedStartDate,
    selectedEndDate,
    setCurrentPage,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredApplications.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredApplications, PAGE_SIZE]);

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

  const applySearch = (value?: string) => {
    const normalized = (value ?? searchQuery).trim();

    if (typeof value === 'string') {
      setSearchQuery(value);
    }

    setSearchKeyword(normalized);
  };

  const applyAdvancedFilters = (filters: CandidateApplicationsAdvancedFilter) => {
    setAdvancedFilters(filters);
  };

  const clearAdvancedFilters = () => {
    // TODO(real-api): If server stores user filter presets, clear/reset them here as well.
    setAdvancedFilters(defaultAdvancedFilters);
    setApplicationFilter('all');
  };

  return {
    applicationFilter,
    setApplicationFilter,
    selectedStartDate,
    selectedEndDate,
    setSelectedStartDate,
    setSelectedEndDate,
    dateRangeLabel,
    applications,
    filteredApplications,
    paginatedApplications,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    goToPage: setCurrentPage,
    goToPreviousPage: goPrev,
    goToNextPage: goNext,
    tabs,
    visiblePages,
    statusMeta,
    filterMeta,
    searchQuery,
    setSearchQuery,
    searchKeyword,
    applySearch,
    isSearching,
    advancedFilters,
    applyAdvancedFilters,
    clearAdvancedFilters,
    activeAdvancedFilterCount,
    companyOptions,
    jobTypeOptions,
    locationOptions,
  };
}
