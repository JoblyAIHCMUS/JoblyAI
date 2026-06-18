// apps/web/src/hooks/messaging/useUnreadDot.ts
import { useMemo } from 'react';
import { useChatSummary } from './useChatSummary';

// Role-agnostic — takes a userId and returns whether ANY conversation for
// that user is unread. Both sidebars (employer + candidate) pass their
// respective useUser().data?.id. Replaces apps/web/src/hooks/useMessages.ts
// (useUnreadMessagesDot).
export function useUnreadDot(userId?: string): boolean {
  const { data: summaries } = useChatSummary(userId);
  return useMemo(() => (summaries ?? []).some((s) => s.hasUnread), [summaries]);
}
