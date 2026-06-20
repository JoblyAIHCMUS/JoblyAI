import { useMutation } from '@tanstack/react-query';
import { updateProfile, type UpdateProfilePayload } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile',
        text2: error.message,
      });
    },
  });
}
