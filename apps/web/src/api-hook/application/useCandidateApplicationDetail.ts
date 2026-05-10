import { useState } from 'react';
import {
  ApplicationRecord,
  getCandidateApplicationById,
} from '@/api-client/application';

interface UseCandidateApplicationDetailOptions {
  onSuccess?: (data: ApplicationRecord) => void;
  onError?: (error: unknown) => void;
}

export function useCandidateApplicationDetail(
  options?: UseCandidateApplicationDetailOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ApplicationRecord | null>(null);

  const fetchApplicationById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCandidateApplicationById(id);
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

  return { fetchApplicationById, loading, error, data };
}
