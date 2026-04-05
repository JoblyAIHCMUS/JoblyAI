import { useState, useCallback } from 'react';
import { JobPosting, updateJobPosting } from '@/api-client/jobs';

interface UsePublishJobOptions {
  onSuccess?: (data: JobPosting) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for publishing a job posting from DRAFT to OPEN status
 * Requires authentication and ownership (employer/admin)
 */
export function usePublishJob(options?: UsePublishJobOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting | null>(null);

  const publishJob = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await updateJobPosting(id, { status: 'OPEN' });
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

  return { publishJob, loading, error, data };
}
