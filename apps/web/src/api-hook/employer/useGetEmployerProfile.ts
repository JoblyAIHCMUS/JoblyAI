import { useEmployerProfileContext } from './EmployerProfileContext';
import type { EmployerProfileResponse } from '@/api-client/employer';

interface UseGetEmployerProfileOptions {
  onSuccess?: (data: EmployerProfileResponse) => void;
  onError?: (error: unknown) => void;
}

export function useGetEmployerProfile(
  options?: UseGetEmployerProfileOptions
) {
  const context = useEmployerProfileContext();

  return {
    fetchEmployerProfile: () => context.fetchEmployerProfile(options),
    loading: context.loading,
    error: context.error,
    data: context.data,
  };
}
