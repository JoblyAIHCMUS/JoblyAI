import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApplicationRecord } from '@/api-client/application';
import { useListCandidateApplications } from '@/api-hook/application';
import { usePagination } from '@/hooks/usePagination';
import { useCandidate } from '@/features/candidate/context/candidate-context';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
  CANDIDATE_DASHBOARD_STATUS_META,
  CANDIDATE_DASHBOARD_FILTER_META,
} from '@/lib/candidateStatus';
import {
  filterApplicationsByDate,
  getUniqueFilterOptions,
} from '@/lib/candidateFilter';
import {
  ApplicationItem,
  ApplicationFilter,
  CandidateApplicationsAdvancedFilter,
} from '@/types/candidate';

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function containsValue(value?: string | null, keyword?: string) {
  const normalizedKeyword = normalize(keyword);
  if (!normalizedKeyword) {
    return true;
  }

  return (value ?? '').toLowerCase().includes(normalizedKeyword);
}

function formatJobType(value?: string | null) {
  if (!value) {
    return 'Unknown';
  }

  return value
    .split('_')
    .map((segment) => {
      const lower = segment.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function mapApiStatusToCandidateStatus(
  status: ApplicationRecord['status']
): ApplicationItem['status'] {
  switch (status) {
    case 'APPLIED':
      return 'applied';
    case 'PRE_SHORTLIST_PENDING':
      return 'pre-shortlist-pending';
    case 'PRE_SHORTLIST_SUBMITTED':
      return 'pre-shortlist-submitted';
    case 'INTERVIEW':
      return 'interviewing';
    case 'OFFER':
      return 'offered';
    case 'REJECTED':
      return 'rejected';
    case 'WITHDRAWN':
      return 'withdrawn';
    default:
      return 'applied';
  }
}

function mapApplicationRecord(record: ApplicationRecord): ApplicationItem {
  return {
    id: String(record.id),
    jobId: String(record.jobId),
    company: record.job.companyName ?? 'Unknown company',
    logoUrl: record.job.companyLogoUrl ?? undefined,
    location: record.job.location ?? (record.job.remote ? 'Remote' : 'Unknown'),
    jobType: formatJobType(record.job.type),
    title: record.job.title,
    createdAt: record.createdAt.split('T')[0] ?? record.createdAt,
    status: record.jobDeletedAt
      ? 'closed'
      : mapApiStatusToCandidateStatus(record.status),
    recruiterId: record.job.postedBy.id,
    matchPercentage: record.matchPercentage,
    preShortlistQuestionsCount: record.preShortlistQuestionsCount,
  };
}

async function fetchAllCandidateApplications(
  fetchApplications: (query?: { page?: number; pageSize?: number }) => Promise<{
    applications: ApplicationRecord[];
    totalPages: number;
  }>
) {
  const pageSize = 100;
  let page = 1;
  let totalPages = 1;
  const allApplications: ApplicationRecord[] = [];

  do {
    const response = await fetchApplications({ page, pageSize });
    allApplications.push(...response.applications);
    totalPages = Math.max(1, response.totalPages || 1);
    page += 1;
  } while (page <= totalPages);

  return allApplications;
}

export function useCandidateApplicationsQuery() {
  const PAGE_SIZE = 10;
  const { fetchApplications } = useListCandidateApplications();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const statusMeta = CANDIDATE_DASHBOARD_STATUS_META;
  const filterMeta = CANDIDATE_DASHBOARD_FILTER_META;
  const companyOptions = useMemo(
    () => getUniqueFilterOptions(applications, 'company'),
    [applications]
  );
  const jobTypeOptions = useMemo(
    () => getUniqueFilterOptions(applications, 'jobType'),
    [applications]
  );
  const locationOptions = useMemo(
    () => getUniqueFilterOptions(applications, 'location'),
    [applications]
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

  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoadingApplications(true);
    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await fetchAllCandidateApplications(fetchApplications);
      setApplications(result.map(mapApplicationRecord));
    } catch (error) {
      console.error('[CandidateApplicationsQuery] Load failed', { error });
      setApplications([]);
      setSearchError('Unable to load applications. Please try again.');
    } finally {
      setIsLoadingApplications(false);
      setIsSearching(false);
    }
  }, [fetchApplications]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications, reloadTrigger]);

  const reloadApplications = useCallback(() => {
    setReloadTrigger((previous) => previous + 1);
  }, []);

  const filteredApplications = useMemo(() => {
    const dateFiltered = filterApplicationsByDate(
      applications,
      selectedStartDate,
      selectedEndDate
    );
    const normalizedSearchKeyword = normalize(searchKeyword);

    return dateFiltered.filter((item) => {
      if (
        applicationFilter === 'active' &&
        !isActiveApplicationStatus(item.status)
      ) {
        return false;
      }

      if (
        applicationFilter === 'closed' &&
        !isClosedApplicationStatus(item.status)
      ) {
        return false;
      }

      const matchesQuery =
        normalizedSearchKeyword.length === 0 ||
        containsValue(item.title, normalizedSearchKeyword) ||
        containsValue(item.company, normalizedSearchKeyword) ||
        containsValue(item.location, normalizedSearchKeyword) ||
        containsValue(item.jobType, normalizedSearchKeyword);

      if (!matchesQuery) {
        return false;
      }

      if (!containsValue(item.company, advancedFilters.company)) {
        return false;
      }

      if (!containsValue(item.jobType, advancedFilters.jobType)) {
        return false;
      }

      if (!containsValue(item.location, advancedFilters.location)) {
        return false;
      }

      return true;
    });
  }, [
    applicationFilter,
    applications,
    advancedFilters.company,
    advancedFilters.jobType,
    advancedFilters.location,
    searchKeyword,
    selectedStartDate,
    selectedEndDate,
  ]);

  useEffect(() => {
    setIsSearching(isLoadingApplications);
  }, [isLoadingApplications]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / PAGE_SIZE)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const { pages, goPrev, goNext } = usePagination(
    currentPage,
    setCurrentPage,
    totalPages
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    pages,
    statusMeta,
    filterMeta,
    searchQuery,
    setSearchQuery,
    searchKeyword,
    applySearch,
    reloadApplications,
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
