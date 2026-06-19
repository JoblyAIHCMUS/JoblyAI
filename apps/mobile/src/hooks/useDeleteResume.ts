import { useCallback, useState } from 'react';
import { deleteResume } from '../api/candidate';

interface UseDeleteResumeOptions {
  onSuccess?: (data: string) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteResume(options?: UseDeleteResumeOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const deleteResumeRecord = useCallback(
    async (resumeId: number, keepData = false) => {
      setLoading(true);
      setError(null);
      try {
        const result = await deleteResume(resumeId, keepData);
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

  return { deleteResumeRecord, loading, error };
}
