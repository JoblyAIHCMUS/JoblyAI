import { useMutation } from '@tanstack/react-query';
import { createDownloadUrl } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useCreateDownloadUrl() {
  return useMutation<{ downloadUrl: string }, Error, string>({
    mutationFn: createDownloadUrl,
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to load PDF',
        text2: error.message,
      });
    },
  });
}
