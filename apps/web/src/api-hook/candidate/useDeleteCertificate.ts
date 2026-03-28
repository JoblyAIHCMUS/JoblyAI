import { useState } from 'react';
import { deleteCertificate } from '@/api-client/candidate';

interface UseDeleteCertificateOptions {
  onSuccess?: (data: string) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteCertificate(options?: UseDeleteCertificateOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<string | null>(null);

  const deleteCertificateRecord = async (certificateId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteCertificate(certificateId);
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

  return { deleteCertificateRecord, loading, error, data };
}