import { useEffect, useMemo, useRef, useState } from 'react';

import { usePagination } from '@/hooks/usePagination';
import { useCandidate } from '@/features/candidate/context/candidate-context';
import { candidateDashboardService } from '@/services/candidateDashboardService';
import {
  ApplicationFilter,
  CandidateApplicationsAdvancedFilter,
} from '@/types/candidate';

export function useCandidateApplicationsQuery() {
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
  const initialStartDateRef = useRef(selectedStartDate);
  const initialEndDateRef = useRef(selectedEndDate);

  const [applicationFilter, setApplicationFilter] =
    useState<ApplicationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [advancedFilters, setAdvancedFilters] =
    useState<CandidateApplicationsAdvancedFilter>(defaultAdvancedFilters);
  const [filteredApplications, setFilteredApplications] =
    useState(applications);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const runSearch = async () => {
      setSearchError(null);

      const isDefaultQuery =
        searchKeyword.length === 0 &&
        applicationFilter === 'all' &&
        advancedFilters.company.length === 0 &&
        advancedFilters.jobType.length === 0 &&
        advancedFilters.location.length === 0 &&
        selectedStartDate === initialStartDateRef.current &&
        selectedEndDate === initialEndDateRef.current;

      if (isDefaultQuery) {
        const defaultFiltered = candidateDashboardService.filterApplicationsByDate(
          applications,
          selectedStartDate,
          selectedEndDate
        );

        if (!isCancelled) {
          setFilteredApplications(defaultFiltered);
          setIsSearching(false);
        }

        return;
      }

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
      } catch (error) {
        // TODO(real-api): Replace this log with centralized telemetry (Sentry/DataDog).
        console.error('[CandidateApplicationsQuery] Search failed', {
          error,
          query: searchKeyword,
          status: applicationFilter,
          startDate: selectedStartDate,
          endDate: selectedEndDate,
          advancedFilters,
        });

        if (!isCancelled) {
          setSearchError('Unable to load applications. Please try again.');
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
    applications,
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

  const applySearch = (value?: string) => {
    const normalized = (value ?? searchQuery).trim();

    if (typeof value === 'string') {
      setSearchQuery(value);
    }

    setSearchKeyword(normalized);
  };

  const applyAdvancedFilters = (
    filters: CandidateApplicationsAdvancedFilter
  ) => {
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
    applications,
    filteredApplications,
    paginatedApplications,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    goToPage: setCurrentPage,
    goToPreviousPage: goPrev,
    goToNextPage: goNext,
    statusMeta,
    filterMeta,
    searchQuery,
    setSearchQuery,
    searchKeyword,
    applySearch,
    isSearching,
    searchError,
    advancedFilters,
    applyAdvancedFilters,
    clearAdvancedFilters,
    companyOptions,
    jobTypeOptions,
    locationOptions,
  };
}
