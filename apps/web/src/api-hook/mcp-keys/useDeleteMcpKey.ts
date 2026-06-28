import { useCallback, useState } from 'react';
import { deleteMcpKey } from '@/api-client/mcp-keys';

interface UseDeleteMcpKeyOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useDeleteMcpKey(options?: UseDeleteMcpKeyOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const removeKey = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await deleteMcpKey(id);
        options?.onSuccess?.();
      } catch (err) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { removeKey, loading, error };
}
