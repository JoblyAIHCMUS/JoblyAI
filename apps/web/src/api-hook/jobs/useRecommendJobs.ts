import { useState, useCallback } from 'react';
import { getResumeRecommendations } from '@/api-client/matching';
import { PaginatedJobsResponse } from '@/api-client/jobs/types';

interface UseRecommendJobsOptions {
  onSuccess?: (data: PaginatedJobsResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching job recommendations based on a specific resume
 */
export function useRecommendJobs(options?: UseRecommendJobsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<PaginatedJobsResponse | null>(null);

  const fetchRecommendations = useCallback(
    async (resumeId: number, limit?: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getResumeRecommendations(resumeId, limit);
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

  return { fetchRecommendations, loading, error, data };
}
