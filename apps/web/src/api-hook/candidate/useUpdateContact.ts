import { useMutation } from '@tanstack/react-query';
import { updateContact } from '@/api-client/candidate/contact';
import type { UpdateContactPayload } from '@/api-client/candidate/types';
import type { CandidateContact } from '@/api-client/candidate/types';

interface UseUpdateContactOptions {
  onSuccess?: (data: CandidateContact) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateContact(options?: UseUpdateContactOptions) {
  const mutation = useMutation({
    mutationFn: (payload: UpdateContactPayload) => updateContact(payload),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    updateContactRecord: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
