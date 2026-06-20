import { useState, useCallback } from 'react';
import { DeleteFileResponse, deleteGcsFile } from '@/api-client/gcs';

interface UseDeleteGcsFileOptions {
  onSuccess?: (data: DeleteFileResponse) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteGcsFile(options?: UseDeleteGcsFileOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<DeleteFileResponse | null>(null);

  const deleteFile = useCallback(
    async (fileKey: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await deleteGcsFile({ fileKey });
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { deleteFile, loading, error, data };
}
