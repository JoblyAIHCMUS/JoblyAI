import { useCallback, useState } from 'react';
import {
  type JobViewsAnalyticsResponse,
  getJobViewsAnalyticsForJob,
} from '@/api-client/jobs';

interface UseJobViewsAnalyticsForJobOptions {
  onSuccess?: (data: JobViewsAnalyticsResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching job view analytics for a single job.
 * Manual fetch - no auto-polling. Caller is responsible for invoking
 * `fetchAnalytics` from a useEffect when the relevant inputs change.
 */
export function useJobViewsAnalyticsForJob(
  options?: UseJobViewsAnalyticsForJobOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobViewsAnalyticsResponse | null>(null);

  const fetchAnalytics = useCallback(
    async (
      jobId: number,
      startDate?: Date,
      endDate?: Date,
      groupBy: 'day' | 'week' | 'month' = 'day'
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getJobViewsAnalyticsForJob(
          jobId,
          startDate,
          endDate,
          groupBy
        );
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
    // Empty deps - onSuccess/onError are called but don't affect memoization,
    // matching the convention in sibling hooks (see useEmployerJobDetail.ts).
    []
  );

  return {
    fetchAnalytics,
    loading,
    error,
    data,
  };
}
