import { useQuery } from '@tanstack/react-query';
import { getCompanyEmployees } from '../api/company';
import type { CompanyEmployee } from '../api/company';

export function useGetCompanyEmployees(id?: number | null) {
  return useQuery<CompanyEmployee[], Error>({
    queryKey: ['company-employees', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Company ID is required');
      }
      return await getCompanyEmployees(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
