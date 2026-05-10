import { useState, useCallback } from 'react';
import { JobPosting, updateJobPosting } from '@/api-client/jobs';

interface UseCloseJobOptions {
  onSuccess?: (data: JobPosting) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for closing a job posting from OPEN to CLOSED status
 * Requires authentication and ownership (employer/admin)
 */
export function useCloseJob(options?: UseCloseJobOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting | null>(null);

  const closeJob = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await updateJobPosting(id, { status: 'CLOSED' });
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

  return { closeJob, loading, error, data };
}
