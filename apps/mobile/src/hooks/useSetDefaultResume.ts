import { useMutation } from '@tanstack/react-query';
import { setDefaultResume } from '../api/candidate';
import type { CandidateResume } from '../types/candidate';
import Toast from 'react-native-toast-message';

export function useSetDefaultResume() {
  return useMutation<CandidateResume, Error, number>({
    mutationFn: setDefaultResume,
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Default CV updated' });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to set default',
        text2: error.message,
      });
    },
  });
}
