import { useQuery } from '@tanstack/react-query';
import { getCandidateProfile } from '../api/candidate';
import type { CandidateProfileResponse } from '../types/candidate';

export function useGetCandidateProfile() {
  return useQuery<CandidateProfileResponse, Error>({
    queryKey: ['candidate-profile'],
    queryFn: async () => {
      return await getCandidateProfile();
    },
    staleTime: 5 * 60 * 1000,
  });
}