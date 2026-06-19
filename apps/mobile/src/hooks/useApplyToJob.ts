import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createApplication, CreateApplicationPayload } from '../api/application';

export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApplicationPayload) => createApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-applications'] });
    },
  });
}
