import { useState } from 'react';
import {
  createCertificate,
  type CandidateCertificate,
  type CreateCertificatePayload,
} from '@/api-client/candidate';

interface UseCreateCertificateOptions {
  onSuccess?: (data: CandidateCertificate) => void;
  onError?: (error: unknown) => void;
}

export function useCreateCertificate(options?: UseCreateCertificateOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null as unknown);
  const [data, setData] = useState<CandidateCertificate | null>(null);

  const createCertificateRecord = async (payload: CreateCertificatePayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createCertificate(payload);
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

  return { createCertificateRecord, loading, error, data };
}