import { useMutation } from '@tanstack/react-query';
import { createContact } from '@/api-client/candidate/contact';
import type { CreateContactPayload } from '@/api-client/candidate/types';
import type { CandidateContact } from '@/api-client/candidate/types';

interface UseCreateContactOptions {
  onSuccess?: (data: CandidateContact) => void;
  onError?: (error: unknown) => void;
}

export function useCreateContact(options?: UseCreateContactOptions) {
  const mutation = useMutation({
    mutationFn: (payload: CreateContactPayload) => createContact(payload),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    createContactRecord: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
