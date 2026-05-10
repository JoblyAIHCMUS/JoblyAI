import { useState, useCallback } from 'react';
import { searchSkills, type Skill } from '@/api-client/skills';

/**
 * Hook to fetch skills based on search keyword
 * Independent of job pagination - fetches from dedicated API
 */
export function useSkillsFilter() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchSkills = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSkills([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchSkills(keyword);
      setSkills(data);
    } catch (err) {
      setError(err);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { skills, loading, error, fetchSkills };
}
