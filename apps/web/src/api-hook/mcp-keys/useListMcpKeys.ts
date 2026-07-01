import { useCallback, useState } from 'react';
import { listMcpKeys } from '@/api-client/mcp-keys';
import type { McpKeyView } from '@/api-client/mcp-keys';

interface UseListMcpKeysOptions {
  onSuccess?: (data: McpKeyView[]) => void;
  onError?: (error: unknown) => void;
}

export function useListMcpKeys(options?: UseListMcpKeysOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchMcpKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listMcpKeys();
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return { fetchMcpKeys, loading, error };
}
