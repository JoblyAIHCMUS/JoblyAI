import { useState, useCallback } from 'react';
import { getLocationAutocomplete, LocationDetail } from '@/api-client/location';

/**
 * Hook for resolving location autocomplete suggestions
 */
export function useLocationAutocomplete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [suggestions, setSuggestions] = useState<LocationDetail[]>([]);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text || text.trim() === '') {
      setSuggestions([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const results = await getLocationAutocomplete(text);
      setSuggestions(results);
      return results;
    } catch (err: unknown) {
      setError(err);
      console.error('Failed to autocomplete location:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchSuggestions, suggestions, loading, error, setSuggestions };
}
