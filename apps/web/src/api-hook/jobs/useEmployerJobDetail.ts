import { useState, useCallback } from 'react';
import { JobPosting, getEmployerJobById } from '@/api-client/jobs';

interface UseEmployerJobDetailOptions {
  onSuccess?: (data: JobPosting) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching detailed information about a single job as an authenticated employer
 * Returns all job statuses (DRAFT, OPEN, CLOSED) if employer owns the job
 */
export function useEmployerJobDetail(options?: UseEmployerJobDetailOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting | null>(null);

  const fetchEmployerJobDetail = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getEmployerJobById(id);
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
    // Empty deps - fetchEmployerJobDetail is stable across renders
    // Options callbacks are called but don't affect memoization
    []
  );

  return { fetchEmployerJobDetail, loading, error, data };
}
