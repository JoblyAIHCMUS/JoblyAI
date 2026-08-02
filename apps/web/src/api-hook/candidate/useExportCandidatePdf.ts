import { useState } from 'react';
import { exportCandidatePdfApi } from '@/api-client/candidate/exportPdf';

interface UseExportCandidatePdfOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Custom hook for exporting candidate profile to vector PDF via NestJS Puppeteer backend.
 */
export function useExportCandidatePdf(
  options?: UseExportCandidatePdfOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const exportPdf = async (candidateData: any, customFileName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await exportCandidatePdfApi(candidateData);
      const rawName = candidateData?.name || 'Candidate';
      const fileName =
        customFileName || `CV_${rawName.replace(/\s+/g, '_')}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      options?.onSuccess?.();
      return blob;
    } catch (err) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { exportPdf, loading, error };
}
