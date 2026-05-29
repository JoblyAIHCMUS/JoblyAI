import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateJobPosting } from '../api/employerJobs';
import { JobPosting, UpdateJobPayload } from '../types/job';

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
  const queryClient = useQueryClient();

  const submitUpdate = async (id: number, payload: UpdateJobPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateJobPosting(id, payload);
      setData(result);
      // Invalidate the job detail cache to force a refetch with updated data
      queryClient.invalidateQueries({
        queryKey: ['employer-job-detail', id],
      });
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
