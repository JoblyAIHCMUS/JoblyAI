import { useCallback, useState } from 'react';
import { getLocationAutocomplete, type ApiOptions } from '../api/location';
import type { LocationDetail } from '../types/location';

/**
 * Hook for resolving location autocomplete suggestions from the backend
 * geocoder. Mirrors the web app's useLocationAutocomplete hook.
 */
export function useLocationAutocomplete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [suggestions, setSuggestions] = useState<LocationDetail[]>([]);

  const fetchSuggestions = useCallback(
    async (text: string, options?: ApiOptions) => {
      if (!text || text.trim() === '') {
        setSuggestions([]);
        return [];
      }

      setLoading(true);
      setError(null);
      try {
        const results = await getLocationAutocomplete(text, options);
        setSuggestions(results);
        return results;
      } catch (err: unknown) {
        setError(err);
        console.error('Failed to autocomplete location:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    fetchSuggestions,
    suggestions,
    loading,
    error,
    setSuggestions,
  };
}
