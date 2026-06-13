import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useUser } from './useUser';
import { initConversation } from '../api/messages';

export type MessageCandidateResult = {
  loading: boolean;
  error: unknown | null;
  messageCandidate: (candidateId: string) => Promise<void>;
};

export function useMessageCandidate(): MessageCandidateResult {
  const router = useRouter();
  const { data: user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const messageCandidate = useCallback(
    async (candidateId: string) => {
      if (!user?.id) {
        Toast.show({
          type: 'error',
          text1: 'User not found',
          text2: 'Please log in again.',
        });
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await initConversation(candidateId);
      } catch (err) {
        // Graceful degradation: if the backend doesn't have this endpoint yet,
        // still navigate to the messages screen so the user can find or start
        // the conversation manually.
        console.warn(
          '[useMessageCandidate] initConversation failed; navigating anyway',
          err
        );
      } finally {
        setLoading(false);
        router.push({
          pathname: '/pages/employer/messages',
          params: { candidateId },
        });
      }
    },
    [router, user?.id]
  );

  return { loading, error, messageCandidate };
}
