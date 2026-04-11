import { useCallback, useState } from 'react';
import { getCompanyEmployees, type CompanyEmployee } from '@/api-client/company';

interface UseGetCompanyEmployeesOptions {
  onSuccess?: (data: CompanyEmployee[]) => void;
  onError?: (error: unknown) => void;
}

export function useGetCompanyEmployees(options?: UseGetCompanyEmployeesOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<CompanyEmployee[]>([]);

  const fetchCompanyEmployees = useCallback(
    async (companyId: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getCompanyEmployees(companyId);
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

  return { fetchCompanyEmployees, loading, error, data };
}
