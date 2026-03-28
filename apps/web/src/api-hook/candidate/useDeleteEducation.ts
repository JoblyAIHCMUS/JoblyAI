import { useState } from 'react';
import { deleteEducation } from '@/api-client/candidate';

interface UseDeleteEducationOptions {
  onSuccess?: (data: string) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteEducation(options?: UseDeleteEducationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<string | null>(null);

  const deleteEducationRecord = async (educationId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteEducation(educationId);
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

  return { deleteEducationRecord, loading, error, data };
}