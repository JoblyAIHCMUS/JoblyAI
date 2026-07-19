import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { deleteAvatar as deleteCandidateAvatar } from '../api/candidate';
import { deleteAvatar as deleteEmployerAvatar } from '../api/employer';

export function useDeleteCandidateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteCandidateAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
      Toast.show({
        type: 'success',
        text1: 'Profile picture removed',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to remove profile picture',
        text2: error?.message ?? 'Please try again.',
      });
    },
  });
}

export function useDeleteEmployerAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteEmployerAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
      Toast.show({
        type: 'success',
        text1: 'Profile picture removed',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to remove profile picture',
        text2: error?.message ?? 'Please try again.',
      });
    },
  });
}
