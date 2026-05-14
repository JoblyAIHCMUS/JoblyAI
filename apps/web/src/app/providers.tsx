'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { MantineProvider } from '@mantine/core';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';
import { SocketProvider } from '@/contexts/socket-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true, // Refetch when user refocuses tab
      retry: 3,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider>
      <SessionProvider>
        <SocketProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster 
              position="bottom-right" 
              richColors 
              expand={true}
              visibleToasts={5}
              closeButton
            />
          </QueryClientProvider>
        </SocketProvider>
      </SessionProvider>
    </MantineProvider>
  );
}
