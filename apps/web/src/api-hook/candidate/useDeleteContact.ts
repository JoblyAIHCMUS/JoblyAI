import { useMutation } from '@tanstack/react-query';
import { deleteContact } from '@/api-client/candidate/contact';

interface UseDeleteContactOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useDeleteContact(options?: UseDeleteContactOptions) {
  const mutation = useMutation({
    mutationFn: (id: number) => deleteContact(id),
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });

  return {
    deleteContactRecord: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}
