'use client';

import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { SocketProvider } from '@/contexts/socket-provider';
import { useAiSocket } from '@/hooks/useAiSocket';
import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/lib/query/queryClient';

function GlobalAiSocket() {
  const { data: session } = authClient.useSession();
  useAiSocket(session?.user?.id);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <GlobalAiSocket />
            {children}
            <Toaster
              position="bottom-right"
              richColors
              expand={true}
              visibleToasts={5}
              closeButton
              style={{ zIndex: 10000 }}
              toastOptions={{
                style: {
                  zIndex: 10001,
                },
              }}
            />
          </SocketProvider>
        </QueryClientProvider>
      </SessionProvider>
    </MantineProvider>
  );
}
