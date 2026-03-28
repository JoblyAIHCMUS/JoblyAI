import { useState } from 'react';
import { deleteResume } from '@/api-client/candidate';

interface UseDeleteResumeOptions {
  onSuccess?: (data: string) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteResume(options?: UseDeleteResumeOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<string | null>(null);

  const deleteResumeRecord = async (resumeId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteResume(resumeId);
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

  return { deleteResumeRecord, loading, error, data };
}