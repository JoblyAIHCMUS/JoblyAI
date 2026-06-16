import { useQuery } from '@tanstack/react-query';
import { getCompanyById } from '../api/company';
import type { Company } from '../types/company';

export function useGetCompany(id?: number | null) {
  const isValidCompanyId =
    typeof id === 'number' && Number.isFinite(id) && id > 0;

  return useQuery<Company, Error>({
    queryKey: ['company', id],
    queryFn: async ({ signal }) => {
      if (!isValidCompanyId) {
        throw new Error('Company ID is required');
      }

      return await getCompanyById(id, { signal });
    },
    enabled: isValidCompanyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
