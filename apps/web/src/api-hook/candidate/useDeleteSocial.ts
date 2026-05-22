import { useMutation } from '@tanstack/react-query';
import { deleteSocial } from '@/api-client/candidate/social';

interface UseDeleteSocialOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useDeleteSocial(options?: UseDeleteSocialOptions) {
  const mutation = useMutation({
    mutationFn: (id: number) => deleteSocial(id),
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    deleteSocialRecord: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
