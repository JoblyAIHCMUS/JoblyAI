import { useCallback, useState } from 'react';
import { getEmployerProfile } from '../api/employer';
import { EmployerProfileResponse } from '../types/employer';

export function useGetEmployerProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<EmployerProfileResponse | null>(null);

  const fetchEmployerProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEmployerProfile();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchEmployerProfile, loading, error, data };
}
