import { useState, useCallback } from 'react';
import { JobPosting, updateJobPosting } from '@/api-client/jobs';

interface UseRevertJobToDraftOptions {
  onSuccess?: (data: JobPosting) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for reverting a job posting back to DRAFT status
 * Can revert from OPEN or CLOSED status back to DRAFT
 * Requires authentication and ownership (employer/admin)
 */
export function useRevertJobToDraft(options?: UseRevertJobToDraftOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<JobPosting | null>(null);

  const revertToDraft = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await updateJobPosting(id, { status: 'DRAFT' });
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

  return { revertToDraft, loading, error, data };
}
