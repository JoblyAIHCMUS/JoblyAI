// apps/web/src/lib/query/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// Module-scoped singleton — every useQueryClient() in the tree reads the
// same client. The defaults mirror apps/mobile/src/lib/query-client.ts.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
