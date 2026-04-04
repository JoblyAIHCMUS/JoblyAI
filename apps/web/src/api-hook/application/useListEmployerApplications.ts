import { useCallback, useState } from 'react';
import {
  EmployerApplicationsQuery,
  PaginatedApplicationsResponse,
  listEmployerApplications,
} from '@/api-client/application';

interface UseListEmployerApplicationsOptions {
  onSuccess?: (data: PaginatedApplicationsResponse) => void;
  onError?: (error: unknown) => void;
  initialPageSize?: number;
}

export function useListEmployerApplications(
  options?: UseListEmployerApplicationsOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<
    PaginatedApplicationsResponse['applications'] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(options?.initialPageSize || 10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchApplications = useCallback(
    async (query?: EmployerApplicationsQuery, page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listEmployerApplications({
          ...query,
          page,
          pageSize,
        });
        setData(result.applications);
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
    [pageSize, options?.onSuccess, options?.onError]
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    fetchApplications,
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
