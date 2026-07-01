// apps/web/src/api-hook/pre-shortlist/useEmployerPreShortlist.ts

'use client';

import { useQuery } from '@tanstack/react-query';
import { getPreShortlistForApplication } from '@/api-client/pre-shortlist';

const QUERY_KEY = (applicationId: number) =>
  ['employer-pre-shortlist', applicationId] as const;

export function useEmployerPreShortlist(applicationId: number) {
  const query = useQuery({
    queryKey: QUERY_KEY(applicationId),
    queryFn: () => getPreShortlistForApplication(applicationId),
    enabled: Number.isFinite(applicationId) && applicationId > 0,
    staleTime: 10 * 1000,
    refetchInterval: (q) => {
      const data = q.state.data;
      if (
        data?.preShortlistStatus === 'PENDING' &&
        data?.status === 'PRE_SHORTLIST_SUBMITTED'
      ) {
        return 5_000;
      }
      return false;
    },
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
