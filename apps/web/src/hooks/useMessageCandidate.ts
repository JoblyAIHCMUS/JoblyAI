import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useInitializeConversation } from '@/api-hook/messages';
import { useToast } from '@/hooks/useToast';

/**
 * Hook to handle messaging a candidate from employer context.
 * Initializes or retrieves an existing conversation, then navigates to the messages page.
 *
 * @returns Object with handleMessageCandidate function and loading state
 */
export const useMessageCandidate = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: user } = useUser();
  const { initChat, loading } = useInitializeConversation({
    onError: (error) => {
      console.error('Failed to initialize conversation with candidate:', error);
      toast.error('Failed to open conversation. Please try again.');
    },
  });

  const handleMessageCandidate = async (candidateId: string): Promise<void> => {
    if (!user?.id) {
      toast.error('User not found. Please log in again.');
      return;
    }

    try {
      await initChat(user.id, candidateId);
      router.push(`/employer/messages?candidateId=${candidateId}`);
    } catch (error) {
      console.error('Error initiating conversation:', error);
      // Error toast is already shown via the hook's onError callback
    }
  };

  return {
    handleMessageCandidate,
    isLoading: loading,
  };
};
