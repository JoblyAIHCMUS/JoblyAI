import { useState } from 'react';
import { deleteExperience } from '@/api-client/candidate';

interface UseDeleteExperienceOptions {
  onSuccess?: (data: string) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteExperience(options?: UseDeleteExperienceOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<string | null>(null);

  const deleteExperienceRecord = async (experienceId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteExperience(experienceId);
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

  return { deleteExperienceRecord, loading, error, data };
}