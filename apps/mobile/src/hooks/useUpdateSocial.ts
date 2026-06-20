import { useMutation } from '@tanstack/react-query';
import { updateSocial, type UpdateSocialPayload } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useUpdateSocial() {
  return useMutation({
    mutationFn: (payload: UpdateSocialPayload) => updateSocial(payload),
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update social link',
        text2: error.message,
      });
    },
  });
}
