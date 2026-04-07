import { useState, useCallback } from 'react';
import {
  ApplicationRecord,
  getEmployerApplicationById,
} from '@/api-client/application';

interface UseEmployerApplicationDetailOptions {
  onSuccess?: (data: ApplicationRecord) => void;
  onError?: (error: unknown) => void;
}

export function useEmployerApplicationDetail(
  options?: UseEmployerApplicationDetailOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ApplicationRecord | null>(null);

  const fetchApplicationById = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getEmployerApplicationById(id);
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

  return { fetchApplicationById, loading, error, data };
}
