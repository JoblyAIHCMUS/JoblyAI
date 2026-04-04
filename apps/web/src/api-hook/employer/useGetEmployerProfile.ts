import { useState, useCallback } from 'react';
import {
  getEmployerProfile,
  type EmployerProfileResponse,
} from '@/api-client/employer';

interface UseGetEmployerProfileOptions {
  onSuccess?: (data: EmployerProfileResponse) => void;
  onError?: (error: unknown) => void;
}

export function useGetEmployerProfile(options?: UseGetEmployerProfileOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<EmployerProfileResponse | null>(null);

  const fetchEmployerProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEmployerProfile();
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
  }, [options?.onSuccess, options?.onError]);

  return { fetchEmployerProfile, loading, error, data };
}
