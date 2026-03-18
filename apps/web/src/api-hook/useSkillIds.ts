import { useState } from 'react';
import { fetchSkillsByNames, createSkill, Skill } from '@/api-client/skillsAPI';

export function useSkillIds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Given an array of skill names, returns an array of skill objects (with id and name)
  const getOrCreateSkills = async (names: string[]): Promise<Skill[]> => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch existing skills by names
      const existing = await fetchSkillsByNames(names);
      const foundNames = new Set(existing.map((s) => s.name.toLowerCase()));
      // 2. For names not found, create them
      const toCreate = names.filter((n) => !foundNames.has(n.toLowerCase()));
      const created: Skill[] = await Promise.all(
        toCreate.map((name) => createSkill(name))
      );
      return [...existing, ...created];
    } catch (err: unknown) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getOrCreateSkills, loading, error };
}
