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

  // Don't include options in dependency array - options are just configuration
  // The context function is stable regardless of options
  const fetchCandidateProfile = useCallback(
    (candidateId?: string) =>
      context.fetchCandidateProfile(options, candidateId),
    [context]
  );

  return {
    fetchCandidateProfile,
    loading: context.loading,
    error: context.error,
    data: context.data,
  };
}
