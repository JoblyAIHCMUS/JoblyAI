// apps/web/src/hooks/messaging/useMarkAsReadOnFocus.ts
import { useCallback, useEffect, useRef } from 'react';
import { useMarkAsRead } from './useMarkAsRead';

interface Opts {
  chatId: string;
  friendId?: string;
  userId: string;
}

const DEBOUNCE_MS = 500;

export function useMarkAsReadOnFocus(opts: Opts) {
  const markAsRead = useMarkAsRead({
    chatId: opts.chatId,
    friendId: opts.friendId,
    userId: opts.userId,
  });
  // Keep the latest mutate reference without making `fire` depend on the
  // unstable mutation object. If `fire` depended on `markAsRead`, the mount
  // effect would re-run on every render (because cache updates cause re-renders
  // that recreate the mutation object), creating an infinite mark_read loop.
  const markAsReadRef = useRef(markAsRead);
  markAsReadRef.current = markAsRead;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback(() => {
    if (!opts.friendId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      markAsReadRef.current.mutate();
    }, DEBOUNCE_MS);
  }, [opts.friendId]);

  // Mount + on chatId/friendId/userId change → fire once (debounced).
  useEffect(() => {
    if (!opts.friendId) return;
    fire();
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [opts.chatId, opts.friendId, opts.userId, fire]);

  // visibilitychange + focus → fire (debounced).
  useEffect(() => {
    if (!opts.friendId) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible' || document.hasFocus()) fire();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [opts.friendId, fire]);
}
