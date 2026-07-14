import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getResumeRecommendations } from '@/api-client/matching';
import { PaginatedJobsResponse, ListJobsQuery } from '@/api-client/jobs/types';

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
    async (resumeId: number, query?: ListJobsQuery) => {
      const toastId = `recommendations-loading-${resumeId}`;
      setLoading(true);
      setError(null);
      toast.info('Calculating match scores for each job...', {
        id: toastId,
        description:
          'This usually takes 5-10 seconds. We are scoring each job against your resume.',
        duration: Infinity,
      });
      try {
        const result = await getResumeRecommendations(resumeId, query);
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    },
    [options]
  );

  return { fetchRecommendations, loading, error, data };
}
