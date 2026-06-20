import { useMutation } from '@tanstack/react-query';
import { deleteSocial } from '../api/candidate';
import Toast from 'react-native-toast-message';

export function useDeleteSocial() {
  return useMutation({
    mutationFn: (id: number) => deleteSocial(id),
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete social link',
        text2: error.message,
      });
    },
  });
}
