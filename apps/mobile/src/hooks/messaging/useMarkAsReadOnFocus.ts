import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useMarkAsRead } from './useMarkAsRead';

interface Options {
  chatId: string;
  friendId: string;
  userId: string;
}

export function useMarkAsReadOnFocus(opts: Options) {
  const markAsRead = useMarkAsRead(opts);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      console.log('[mark-read] debounce→mutate', { chatId: opts.chatId });
      markAsRead.mutate();
    }, 500);
  };

  // Mount-time fire; re-fires on chatId/friendId/userId change. friendId guard avoids a bogus last_seen on cold mount.
  useEffect(() => {
    if (!opts.friendId) {
      console.log('[mark-read] mount skipped (no friendId)', { chatId: opts.chatId });
      return;
    }
    console.log('[mark-read] mount', { chatId: opts.chatId });
    fire();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.chatId, opts.friendId, opts.userId]);

  // Re-fire on AppState→active. Same friendId guard.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && opts.friendId) {
        console.log('[mark-read] AppState→active', { chatId: opts.chatId });
        fire();
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.friendId]);
}
