import { useState } from 'react';
import { JobPosting, listEmployerJobs } from '@/api-client/jobs';

interface UseEmployerJobsOptions {
  onSuccess?: (data: JobPosting[]) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching jobs posted by the current user (employer)
 * Requires authentication
 */
export function useEmployerJobs(options?: UseEmployerJobsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting[] | null>(null);

  const fetchEmployerJobs = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listEmployerJobs(userId);
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
  };

  return { fetchEmployerJobs, loading, error, data };
}
