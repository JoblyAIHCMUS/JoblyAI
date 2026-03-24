import { useState } from 'react';
import { deleteJobPosting } from '@/api-client/jobs';

interface UseDeleteJobOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for deleting a job posting
 * Requires authentication and ownership (employer/admin)
 */
export function useDeleteJob(options?: UseDeleteJobOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const submitDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteJobPosting(id);
      options?.onSuccess?.();
    } catch (err: unknown) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitDelete, loading, error };
}
