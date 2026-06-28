// apps/web/src/api-hook/pre-shortlist/useRetryPreShortlistEvaluation.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { retryPreShortlistEvaluation } from '@/api-client/pre-shortlist';

const QUERY_KEY = (applicationId: number) =>
  ['employer-pre-shortlist', applicationId] as const;

export function useRetryPreShortlistEvaluation(applicationId: number) {
  const queryClient = useQueryClient();

  return useMutation<{ ok: true }, Error, void>({
    mutationFn: () => retryPreShortlistEvaluation(applicationId),
    onSuccess: () => {
      toast.success('Re-queued AI evaluation');
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY(applicationId),
      });
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : 'Failed to retry evaluation';
      toast.error(message);
    },
  });
}
