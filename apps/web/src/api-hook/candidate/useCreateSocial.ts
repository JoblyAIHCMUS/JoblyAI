import { useMutation } from '@tanstack/react-query';
import { createSocial } from '@/api-client/candidate/social';
import type { CreateSocialPayload } from '@/api-client/candidate/types';
import type { CandidateSocial } from '@/api-client/candidate/types';

interface UseCreateSocialOptions {
  onSuccess?: (data: CandidateSocial) => void;
  onError?: (error: unknown) => void;
}

export function useCreateSocial(options?: UseCreateSocialOptions) {
  const mutation = useMutation({
    mutationFn: (payload: CreateSocialPayload) => createSocial(payload),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    createSocialRecord: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
