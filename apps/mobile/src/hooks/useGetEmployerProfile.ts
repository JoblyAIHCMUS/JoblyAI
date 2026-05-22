import { useQuery } from '@tanstack/react-query';
import { getEmployerProfile } from '../api/employer';
import type { EmployerProfileResponse } from '../types/employer';

export function useGetEmployerProfile() {
  return useQuery<EmployerProfileResponse, Error>({
    queryKey: ['employer-profile'],
    queryFn: async () => {
      return await getEmployerProfile();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
