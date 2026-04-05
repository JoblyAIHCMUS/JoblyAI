import { useCallback } from 'react';
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

  const fetchEmployerProfile = useCallback(
    () => context.fetchEmployerProfile(options),
    [context, options]
  );

  return {
    fetchEmployerProfile,
    loading: context.loading,
    error: context.error,
    data: context.data,
  };
}
