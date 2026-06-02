import { useState, useCallback } from 'react';
import { JobPosting, getSimilarJobs } from '@/api-client/jobs';

interface UseSimilarJobsOptions {
  onSuccess?: (data: JobPosting[]) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching similar jobs based on different criteria
 */
export function useSimilarJobs(options?: UseSimilarJobsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting[]>([]);

  const fetchSimilarJobs = useCallback(
    async (params: {
      jobId?: number;
      companyId?: number;
      location?: string;
      limit?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getSimilarJobs(params);
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

  return { fetchSimilarJobs, loading, error, data };
}
