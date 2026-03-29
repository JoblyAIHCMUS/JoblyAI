import axios from 'axios';

export interface Skill {
  id: number;
  name: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchSkillsByNames(names: string[]): Promise<Skill[]> {
  // Assumes backend supports filtering by multiple names
  const response = await axios.get(`${API_BASE_URL}/api/skills`, {
    params: { names: names.join(',') },
  });
  return response.data;
}

export async function createSkill(name: string): Promise<Skill> {
  const response = await axios.post(`${API_BASE_URL}/api/skills`, { name });
  return response.data;
}
