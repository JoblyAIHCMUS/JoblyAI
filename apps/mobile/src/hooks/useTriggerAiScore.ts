import { useMutation } from '@tanstack/react-query';
import { triggerAiScore } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useTriggerAiScore() {
  return useMutation<{ success: boolean }, Error, number>({
    mutationFn: triggerAiScore,
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to start AI scoring',
        text2: error.message,
      });
    },
  });
}
