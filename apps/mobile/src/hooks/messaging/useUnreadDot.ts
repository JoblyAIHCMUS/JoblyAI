import { useMemo } from 'react';
import { useChatSummary } from './useChatSummary';

export function useUnreadDot(userId?: string): boolean {
  const { data: summaries } = useChatSummary(userId);
  return useMemo(() => (summaries ?? []).some((s) => s.hasUnread), [summaries]);
}
