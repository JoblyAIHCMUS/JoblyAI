import { useState, useCallback } from 'react';
import { JobPosting, PaginatedJobsResponse, listEmployerJobs } from '@/api-client/jobs';

interface UseEmployerJobsOptions {
  onSuccess?: (data: PaginatedJobsResponse) => void;
  onError?: (error: unknown) => void;
  initialPageSize?: number;
}

/**
 * Hook for fetching jobs posted by the current user (employer) with pagination support
 * Requires authentication
 */
export function useEmployerJobs(options?: UseEmployerJobsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(options?.initialPageSize || 10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchEmployerJobs = useCallback(
    async (userId: string, page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listEmployerJobs(userId, page, pageSize);
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
    [pageSize]
  );

  const goToPage = (page: number) => {
    // This will be set by the component calling the hook
    setCurrentPage(page);
  };

  return {
    fetchEmployerJobs,
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
