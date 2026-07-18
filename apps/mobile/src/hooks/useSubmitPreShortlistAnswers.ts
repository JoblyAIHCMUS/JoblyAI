import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import {
  submitPreShortlistAnswers,
  type SubmitAnswersRequest,
  type SubmitAnswersResponse,
} from '../api/preShortlist';

const QUERY_KEY = (applicationId: number) =>
  ['candidate-pre-shortlist', applicationId] as const;
const APP_LIST_KEY = ['candidate-applications'] as const;

/**
 * Mirrors apps/web/src/api-hook/pre-shortlist/useSubmitPreShortlistAnswers.ts.
 * Submits the candidate's pre-shortlist answers. On success:
 * - Invalidates the pre-shortlist query (so the form refreshes to read-only).
 * - Invalidates the candidate applications list (so the status badge flips
 *   from PRE_SHORTLIST_PENDING to PRE_SHORTLIST_SUBMITTED).
 * - Shows a success toast.
 * On error: shows an error toast with the API message.
 */
export function useSubmitPreShortlistAnswers(applicationId: number) {
  const queryClient = useQueryClient();

  return useMutation<SubmitAnswersResponse, Error, SubmitAnswersRequest>({
    mutationFn: (payload) => submitPreShortlistAnswers(applicationId, payload),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Pre-shortlist answers submitted',
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY(applicationId),
      });
      void queryClient.invalidateQueries({ queryKey: APP_LIST_KEY });
    },
    onError: (error: any) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to submit your answers. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Submission failed',
        text2: message,
      });
    },
  });
}
