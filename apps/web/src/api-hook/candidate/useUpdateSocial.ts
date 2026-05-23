import { useMutation } from '@tanstack/react-query';
import { updateSocial } from '@/api-client/candidate/social';
import type { UpdateSocialPayload } from '@/api-client/candidate/types';
import type { CandidateSocial } from '@/api-client/candidate/types';

interface UseUpdateSocialOptions {
  onSuccess?: (data: CandidateSocial) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateSocial(options?: UseUpdateSocialOptions) {
  const mutation = useMutation({
    mutationFn: (payload: UpdateSocialPayload) => updateSocial(payload),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    updateSocialRecord: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
