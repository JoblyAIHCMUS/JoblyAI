import { useMutation } from '@tanstack/react-query';
import { previewDeleteImpact } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function usePreviewDeleteImpact() {
  return useMutation<
    { previewBio: string | null; previewTitle: string | null },
    Error,
    number
  >({
    mutationFn: previewDeleteImpact,
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to preview delete impact',
        text2: error.message,
      });
    },
  });
}
