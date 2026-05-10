import { useState } from 'react';
import {
  updateCertificate,
  type UpdateCertificatePayload,
} from '@/api-client/candidate';
import { CandidateCertificate } from '@/types/candidate';

interface UseUpdateCertificateOptions {
  onSuccess?: (data: CandidateCertificate) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateCertificate(options?: UseUpdateCertificateOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateCertificate | null>(null);

  const updateCertificateRecord = async (payload: UpdateCertificatePayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateCertificate(payload);
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

  return { updateCertificateRecord, loading, error, data };
}
