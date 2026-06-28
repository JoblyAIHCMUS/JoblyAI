// apps/web/src/api-hook/pre-shortlist/useCandidatePreShortlist.ts

'use client';

import { useQuery } from '@tanstack/react-query';
import { getCandidatePreShortlist } from '@/api-client/pre-shortlist';

const QUERY_KEY = (applicationId: number) =>
  ['candidate-pre-shortlist', applicationId] as const;

export function useCandidatePreShortlist(applicationId: number) {
  const query = useQuery({
    queryKey: QUERY_KEY(applicationId),
    queryFn: () => getCandidatePreShortlist(applicationId),
    enabled: Number.isFinite(applicationId) && applicationId > 0,
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
