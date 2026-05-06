import { useState, useCallback } from 'react';
import {
  ListJobsQuery,
  PaginatedJobsResponse,
  listJobs,
} from '@/api-client/jobs';

interface UseListJobsOptions {
  onSuccess?: (data: PaginatedJobsResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching paginated jobs list with search and filtering
 * Supports pagination, search query, location, employment type, remote filter, salary range, and skills
 */
export function useListJobs(options?: UseListJobsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<PaginatedJobsResponse | null>(null);

  const fetchJobs = useCallback(
    async (
      query?: ListJobsQuery,
      requestOptions?: { signal?: AbortSignal }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listJobs(query, requestOptions);
        setData(result);
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
    [options]
  );

  return { fetchJobs, loading, error, data };
}
