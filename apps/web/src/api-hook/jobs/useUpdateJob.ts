import { useState } from 'react';
import {
  JobPosting,
  UpdateJobPayload,
  updateJobPosting,
} from '@/api-client/jobs';

interface UseUpdateJobOptions {
  onSuccess?: (data: JobPosting) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for updating an existing job posting
 * Requires authentication and ownership (employer/admin)
 */
export function useUpdateJob(options?: UseUpdateJobOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting | null>(null);

  const submitUpdate = async (id: number, payload: UpdateJobPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateJobPosting(id, payload);
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

  return { submitUpdate, loading, error, data };
}
