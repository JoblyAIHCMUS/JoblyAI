import { useCallback } from 'react';
import { useCandidateProfileContext } from './CandidateProfileContext';
import type { CandidateProfileResponse } from '@/api-client/candidate';

interface UseGetCandidateProfileOptions {
  onSuccess?: (data: CandidateProfileResponse) => void;
  onError?: (error: unknown) => void;
}

export function useGetCandidateProfile(
  options?: UseGetCandidateProfileOptions
) {
  const context = useCandidateProfileContext();

  const fetchCandidateProfile = useCallback(
    () => context.fetchCandidateProfile(options),
    []
  );

  return {
    fetchCandidateProfile,
    loading: context.loading,
    error: context.error,
    data: context.data,
  };
}
