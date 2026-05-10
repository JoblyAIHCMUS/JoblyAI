import { useState } from 'react';
import {
  ApplicationRecord,
  moveToOfferEmployerApplication,
} from '@/api-client/application';

interface UseMoveToOfferApplicationOptions {
  onSuccess?: (data: ApplicationRecord) => void;
  onError?: (error: unknown) => void;
}

export function useMoveToOfferApplication(
  options?: UseMoveToOfferApplicationOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ApplicationRecord | null>(null);

  const moveToOffer = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await moveToOfferEmployerApplication(id);
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

  return { moveToOffer, loading, error, data };
}
