import { useMemo } from 'react';
import { useChatSummary } from './useChatSummary';
import { useGetEmployerProfile } from '../useGetEmployerProfile';

export function useUnreadDot(): boolean {
  const { data: profile } = useGetEmployerProfile();
  const { data: summaries } = useChatSummary(profile?.id);
  return useMemo(
    () => (summaries ?? []).some((s) => s.hasUnread),
    [summaries]
  );
}
