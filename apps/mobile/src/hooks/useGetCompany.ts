import { useQuery } from '@tanstack/react-query';
import { getCompanyById } from '../api/company';
import type { Company } from '../types/company';

export function useGetCompany(id?: number | null) {
  return useQuery<Company, Error>({
    queryKey: ['company', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Company ID is required');
      }
      return await getCompanyById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
