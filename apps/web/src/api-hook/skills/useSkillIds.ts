import { useState } from 'react';
import {
  fetchSkillsByNames,
  createSkill,
  type Skill,
} from '@/api-client/skills';

export function useSkillIds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Given an array of skill names, returns an array of skill objects (with id and name)
  const getOrCreateSkills = async (names: string[]): Promise<Skill[]> => {
    setLoading(true);
    setError(null);
    try {
      // Normalize (trim + lowercase for comparison) and de-duplicate names
      const normalizedToOriginal = new Map<string, string>();
      for (const rawName of names) {
        const trimmed = rawName.trim();
        const normalized = trimmed.toLowerCase();
        if (!normalizedToOriginal.has(normalized)) {
          normalizedToOriginal.set(normalized, trimmed);
        }
      }
      const uniqueNames = Array.from(normalizedToOriginal.values());
      // 1. Fetch existing skills by names
      const existing = await fetchSkillsByNames(uniqueNames);
      const foundNames = new Set(existing.map((s) => s.name.toLowerCase()));
      // 2. For names not found, create them
      const toCreate = uniqueNames.filter(
        (n) => !foundNames.has(n.toLowerCase())
      );
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
