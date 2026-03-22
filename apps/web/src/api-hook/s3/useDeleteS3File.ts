import { useState } from 'react';
import { DeleteFileResponse, deleteS3File } from '@/api-client/s3';

interface UseDeleteS3FileOptions {
  onSuccess?: (data: DeleteFileResponse) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteS3File(options?: UseDeleteS3FileOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<DeleteFileResponse | null>(null);

  const deleteFile = async (fileKey: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteS3File({ fileKey });
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
  };

  return { deleteFile, loading, error, data };
}
