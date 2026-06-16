import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { initConversation } from '../../api/messages';

interface Options {
  userId: string | undefined;
}

export function useInitConversation(opts: Options) {
  const queryClient = useQueryClient();
  return useMutation<{ chatId: string }, Error, string>({
    mutationFn: (friendId) => initConversation(friendId),
    onSuccess: ({ chatId }) => {
      if (opts.userId) {
        queryClient.invalidateQueries({
          queryKey: ['chat-summary', opts.userId],
        });
      }
      router.push({
        pathname: '/pages/employer/messages/[chatId]',
        params: { chatId },
      });
    },
  });
}
