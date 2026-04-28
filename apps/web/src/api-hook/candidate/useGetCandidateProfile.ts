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

  // Only depend on context.fetchCandidateProfile which is stable
  // Options are just callbacks, not real dependencies
  const fetchCandidateProfile = useCallback(
    (candidateId?: string) =>
      context.fetchCandidateProfile(options, candidateId),
    [context.fetchCandidateProfile, options]
  );

  return {
    fetchCandidateProfile,
    loading: context.loading,
    error: context.error,
    data: context.data,
  };
}
