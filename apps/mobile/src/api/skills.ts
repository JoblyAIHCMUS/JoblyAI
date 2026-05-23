import { apiClient } from './config';

export interface Skill {
  id: number;
  name: string;
}

export interface ApiOptions {
  signal?: AbortSignal;
}

export async function searchSkills(
  query: string,
  options?: ApiOptions
): Promise<Skill[]> {
  if (!query.trim()) {
    return [];
  }
  const response = await apiClient.get<Skill[]>('/skills/search', {
    params: { q: query },
    signal: options?.signal,
  });
  return response.data;
}

export async function fetchSkillsByNames(
  names: string[],
  options?: ApiOptions
): Promise<Skill[]> {
  const response = await apiClient.get<Skill[]>('/skills', {
    params: { names: names.join(',') },
    signal: options?.signal,
  });
  return response.data;
}

export async function createSkill(
  name: string,
  options?: ApiOptions
): Promise<Skill> {
  const response = await apiClient.post<Skill>(
    '/skills',
    { name },
    {
      signal: options?.signal,
    }
  );
  return response.data;
}
