import { useMutation } from '@tanstack/react-query';
import { commitResumeMerge } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useCommitResumeMerge() {
  return useMutation<any, Error, { resumeId: number; data: any }>({
    mutationFn: ({ resumeId, data }) => commitResumeMerge(resumeId, data),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Profile synced with resume data!',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to sync profile',
        text2: error.message,
      });
    },
  });
}
