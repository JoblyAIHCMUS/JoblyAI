import axios from 'axios';
import type {
  CandidateExperience,
  CreateExperiencePayload,
  UpdateExperiencePayload,
} from '@/api-client/candidate/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createExperience(
  payload: CreateExperiencePayload
): Promise<CandidateExperience> {
  const response = await axios.post<CandidateExperience>(
    `${API_BASE_URL}/api/candidate/me/experience`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function updateExperience(
  payload: UpdateExperiencePayload
): Promise<CandidateExperience> {
  const response = await axios.patch<CandidateExperience>(
    `${API_BASE_URL}/api/candidate/me/experience`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function deleteExperience(experienceId: number): Promise<string> {
  const response = await axios.delete<string>(
    `${API_BASE_URL}/api/candidate/me/experience/${experienceId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
}