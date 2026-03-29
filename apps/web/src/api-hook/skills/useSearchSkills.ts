import { useState, useCallback, useRef } from 'react';
import { searchSkills, type Skill } from '@/api-client/skills';

export function useSearchSkills() {
  const [results, setResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (query: string) => {
    // Clear previous timer
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

    // Debounce the search by 300ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const data = await searchSkills(query);
        setResults(data);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  return { results, loading, error, search };
}
