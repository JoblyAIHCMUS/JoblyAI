import { useCallback, useRef, useState } from 'react';
import {
  searchEmployers,
  type EmployerSearchResult,
} from '@/api-client/employer';

export function useSearchEmployers() {
  const [results, setResults] = useState<EmployerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(
    async (
      query: string,
      options?: {
        offset?: number;
        limit?: number;
      }
    ) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const data = await searchEmployers({
            name: query,
            email: query,
            offset: options?.offset,
            limit: options?.limit,
          });
          setResults(data);
        } catch (err) {
          setError(err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    []
  );

  return { results, loading, error, search };
}
