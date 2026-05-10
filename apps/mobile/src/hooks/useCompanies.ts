import { useState, useEffect } from 'react';
import { getCompanies } from '../api/company';
import { Company } from '../types/company';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanies({ signal });
      setCompanies(data);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' ||
          (err as any).code === 'ERR_CANCELED' ||
          err.name === 'AbortError')
      )
        return;
      setError(
        err instanceof Error ? err : new Error('Failed to fetch companies')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCompanies(controller.signal);
    return () => controller.abort();
  }, []);

  return { companies, loading, error, refetch: () => fetchCompanies() };
}
