import { useState, useCallback } from 'react';
import {
  JobPosting,
  PaginatedJobsResponse,
  listEmployerJobsByCompany,
} from '@/api-client/jobs';

interface UseEmployerCompanyJobsOptions {
  companyId?: number | null;
  onSuccess?: (data: PaginatedJobsResponse) => void;
  onError?: (error: unknown) => void;
  initialPageSize?: number;
}

/**
 * Hook for fetching jobs posted by a company with pagination support
 * Requires authentication and employer to be registered to that company
 */
export function useEmployerCompanyJobs(
  options?: UseEmployerCompanyJobsOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(options?.initialPageSize || 10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCompanyJobs = useCallback(
    async (companyId: number, page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listEmployerJobsByCompany(
          companyId,
          page,
          pageSize
        );
        setData(result.jobs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setCurrentPage(result.page);
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pageSize, options]
  );

  const goToPage = (page: number) => {
    // This will be set by the component calling the hook
    setCurrentPage(page);
  };

  return {
    fetchCompanyJobs,
    loading,
    error,
    data,
    currentPage,
    pageSize,
    total,
    totalPages,
    goToPage,
  };
}
