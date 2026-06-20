import { useMutation } from '@tanstack/react-query';
import { createSocial, type CreateSocialPayload } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useCreateSocial() {
  return useMutation({
    mutationFn: (payload: CreateSocialPayload) => createSocial(payload),
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to add social link',
        text2: error.message,
      });
    },
  });
}
