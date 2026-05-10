import { useState, useCallback } from 'react';
import {
  updateCompanyLogo,
  type UpdateCompanyLogoPayload,
  type Company,
} from '@/api-client/company';

interface UseUpdateCompanyLogoOptions {
  onSuccess?: (data: Company) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for updating company logo
 *
 * Usage:
 * const { updateLogoRecord, loading, error, data } = useUpdateCompanyLogo({
 *   onSuccess: (data) => console.log('Logo updated', data),
 * });
 *
 * // Call after successfully uploading file to S3:
 * await updateLogoRecord(companyId, { fileKey: '...', fileUrl: '...' });
 */
export function useUpdateCompanyLogo(options?: UseUpdateCompanyLogoOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<Company | null>(null);

  const updateLogoRecord = useCallback(
    async (companyId: number, payload: UpdateCompanyLogoPayload) => {
      setLoading(true);
      setError(null);

      try {
        const result = await updateCompanyLogo(companyId, payload);
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

  return { updateLogoRecord, loading, error, data };
}
