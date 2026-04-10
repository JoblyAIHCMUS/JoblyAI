import { useState, useCallback } from 'react';
import { JobPosting, updateJobPosting } from '@/api-client/jobs';
import type { JobStatus } from '@/types/job';

interface UseUpdateJobStatusOptions {
  onSuccess?: (data: JobPosting) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for updating a job posting status to any valid state
 * Supports bidirectional state conversion between DRAFT, OPEN, and CLOSED
 * Requires authentication and ownership (employer/admin)
 */
export function useUpdateJobStatus(options?: UseUpdateJobStatusOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting | null>(null);

  const updateStatus = useCallback(
    async (id: number, status: JobStatus) => {
      setLoading(true);
      setError(null);
      try {
        const result = await updateJobPosting(id, { status });
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

  return { updateStatus, loading, error, data };
}
