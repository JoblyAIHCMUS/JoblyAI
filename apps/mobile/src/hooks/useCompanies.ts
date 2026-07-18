import { useState, useEffect } from 'react';
import {
  getCompanies,
  type GetCompaniesParams,
  type PaginatedCompaniesResponse,
} from '../api/company';
import { Company } from '../types/company';

export function useCompanies(params?: GetCompaniesParams) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<Omit<
    PaginatedCompaniesResponse,
    'companies'
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompanies = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanies({ ...params, signal });
      setCompanies(Array.isArray(data.companies) ? data.companies : []);
      setPagination({
        total: data.total ?? 0,
        page: data.page ?? 1,
        pageSize: data.pageSize ?? 10,
        totalPages: data.totalPages ?? 1,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === 'CanceledError' ||
          (err as unknown as Record<string, unknown>).code === 'ERR_CANCELED' ||
          err.name === 'AbortError')
      )
        return;
      setCompanies([]);
      setPagination(null);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch companies')
      );
    } finally {
      setLoading(false);
    }
  };

  const sizeRangeKey = params?.sizeRange?.join(',');

  useEffect(() => {
    const controller = new AbortController();
    fetchCompanies(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params?.page,
    params?.pageSize,
    params?.q,
    params?.location,
    sizeRangeKey,
  ]);

  return {
    companies,
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    pageSize: pagination?.pageSize ?? 10,
    totalPages: pagination?.totalPages ?? 1,
    loading,
    error,
    refetch: () => fetchCompanies(),
  };
}
