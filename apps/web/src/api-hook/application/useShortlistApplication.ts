import { useState } from 'react';
import {
  ApplicationRecord,
  shortlistEmployerApplication,
} from '@/api-client/application';

interface UseShortlistApplicationOptions {
  onSuccess?: (data: ApplicationRecord) => void;
  onError?: (error: unknown) => void;
}

export function useShortlistApplication(
  options?: UseShortlistApplicationOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ApplicationRecord | null>(null);

  const shortlistApplication = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await shortlistEmployerApplication(id);
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

  return { shortlistApplication, loading, error, data };
}
