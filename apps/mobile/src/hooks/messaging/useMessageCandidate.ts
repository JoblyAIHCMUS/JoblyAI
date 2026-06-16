import { useInitConversation } from './useInitConversation';

interface Options {
  employerId: string | undefined;
}

export function useMessageCandidate(opts: Options) {
  return useInitConversation({ userId: opts.employerId });
}
