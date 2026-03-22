import { useState } from 'react';
import {
  ApplicationRecord,
  withdrawCandidateApplication,
} from '@/api-client/application';

interface UseWithdrawApplicationOptions {
  onSuccess?: (data: ApplicationRecord) => void;
  onError?: (error: unknown) => void;
}

export function useWithdrawApplication(
  options?: UseWithdrawApplicationOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ApplicationRecord | null>(null);

  const withdrawApplication = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await withdrawCandidateApplication(id);
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

  return { withdrawApplication, loading, error, data };
}
