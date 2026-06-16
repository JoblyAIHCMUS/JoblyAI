import { useMutation } from '@tanstack/react-query';
import { deleteResume } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useDeleteResume() {
  return useMutation<string, Error, { resumeId: number; keepData?: boolean }>({
    mutationFn: ({ resumeId, keepData }) => deleteResume(resumeId, keepData),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'CV deleted successfully' });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Delete failed',
        text2: error.message,
      });
    },
  });
}
