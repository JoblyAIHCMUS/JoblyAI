import { useMutation } from '@tanstack/react-query';
import { triggerAiParse } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useTriggerAiParse() {
  return useMutation<{ success: boolean }, Error, number>({
    mutationFn: triggerAiParse,
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to start AI parsing',
        text2: error.message,
      });
    },
  });
}
