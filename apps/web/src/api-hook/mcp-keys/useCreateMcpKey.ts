import { useCallback, useState } from 'react';
import { createMcpKey } from '@/api-client/mcp-keys';
import type {
  CreateMcpKeyDto,
  CreateMcpKeyResponse,
} from '@/api-client/mcp-keys';

interface UseCreateMcpKeyOptions {
  onSuccess?: (data: CreateMcpKeyResponse) => void;
  onError?: (error: unknown) => void;
}

export function useCreateMcpKey(options?: UseCreateMcpKeyOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const createKey = useCallback(
    async (dto: CreateMcpKeyDto) => {
      setLoading(true);
      setError(null);
      try {
        const result = await createMcpKey(dto);
        options?.onSuccess?.(result);
        return result;
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

  return { createKey, loading, error };
}
