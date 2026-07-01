// apps/web/src/api-hook/pre-shortlist/useSubmitPreShortlistAnswers.ts

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  submitPreShortlistAnswers,
  type SubmitAnswersRequest,
  type SubmitAnswersResponse,
} from '@/api-client/pre-shortlist';

const QUERY_KEY = (applicationId: number) =>
  ['candidate-pre-shortlist', applicationId] as const;
const APP_LIST_KEY = ['candidate-applications'] as const;

export function useSubmitPreShortlistAnswers(applicationId: number) {
  const queryClient = useQueryClient();

  return useMutation<SubmitAnswersResponse, Error, SubmitAnswersRequest>({
    mutationFn: (payload) => submitPreShortlistAnswers(applicationId, payload),
    onSuccess: () => {
      toast.success('Pre-shortlist answers submitted');
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY(applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: APP_LIST_KEY });
    },
    onError: (err) => {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to submit your answers. Please try again.';
      toast.error(message);
    },
  });
}
