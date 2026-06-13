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
      markAsRead.mutate();
    }, 500);
  };

  // 1. Mark read on mount
  useEffect(() => {
    fire();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.chatId, opts.friendId, opts.userId]);

  // 2. Mark read when app foregrounds while this screen is focused
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fire();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
