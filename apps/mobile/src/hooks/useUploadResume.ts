import { useMutation } from '@tanstack/react-query';
import { uploadResume, type UploadResumePayload } from '../api/candidate';
import type { CandidateResume } from '../types/candidate';
import Toast from 'react-native-toast-message';

export function useUploadResume() {
  return useMutation<CandidateResume, Error, UploadResumePayload>({
    mutationFn: uploadResume,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'CV uploaded!',
        text2: 'AI is analyzing...',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: error.message,
      });
    },
  });
}
