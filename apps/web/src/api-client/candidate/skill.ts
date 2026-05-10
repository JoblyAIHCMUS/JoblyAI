import axios from 'axios';
import type { CandidateSkill } from '@/api-client/candidate/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createSkill(skill: string): Promise<CandidateSkill> {
  const response = await axios.post<CandidateSkill>(
    `${API_BASE_URL}/api/candidate/me/skills`,
    { title: skill },
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data;
}

export async function deleteSkill(skillId: number): Promise<number> {
  await axios.delete(`${API_BASE_URL}/api/candidate/me/skills/${skillId}`, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return skillId;
}
