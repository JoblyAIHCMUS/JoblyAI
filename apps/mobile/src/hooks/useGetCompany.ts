import { useState, useEffect, useCallback } from 'react';
import { getCompanyById, type Company } from '../api/company';

export function useGetCompany() {
  const [data, setData] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompany = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCompanyById(id);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch company')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchCompany };
}
