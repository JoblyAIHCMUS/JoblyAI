import { useInitConversation } from './useInitConversation';

interface Options {
  employerId: string;
  candidateId: string;
}

export function useMessageCandidate(opts: Options) {
  return useInitConversation({
    userId: opts.employerId,
    friendId: opts.candidateId,
  });
}
