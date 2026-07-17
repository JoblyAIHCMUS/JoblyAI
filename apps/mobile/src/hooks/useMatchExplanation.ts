import { useQuery } from '@tanstack/react-query';
import { getMatchExplanation, type MatchExplanation } from '../api/matchExplanation';

export function useMatchExplanation(
  applicationId: string | number | null | undefined
) {
  return useQuery<MatchExplanation, Error>({
    queryKey: ['match-explanation', applicationId],
    queryFn: () => getMatchExplanation(applicationId as string | number),
    enabled: applicationId != null,
    staleTime: 60 * 1000,
  });
}
