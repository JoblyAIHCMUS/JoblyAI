import { useQuery } from '@tanstack/react-query';
import { getCandidateProfileById } from '../api/candidate';
import type { CandidateProfileResponse } from '../types/candidate';

export function useGetCandidateProfileById(candidateId?: string) {
  return useQuery<CandidateProfileResponse, Error>({
    queryKey: ['candidate-profile', candidateId],
    queryFn: async () => {
      if (!candidateId) {
        throw new Error('candidateId is required');
      }
      return await getCandidateProfileById(candidateId);
    },
    enabled: !!candidateId,
    staleTime: 5 * 60 * 1000,
  });
}
