import axios from 'axios';
import type {
  CandidateEducation,
  CreateEducationPayload,
  UpdateEducationPayload,
} from '@/api-client/candidate/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createEducation(
  payload: CreateEducationPayload
): Promise<CandidateEducation> {
  const response = await axios.post<CandidateEducation>(
    `${API_BASE_URL}/api/candidate/me/education`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function updateEducation(
  payload: UpdateEducationPayload
): Promise<CandidateEducation> {
  const response = await axios.patch<CandidateEducation>(
    `${API_BASE_URL}/api/candidate/me/education`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function deleteEducation(educationId: number): Promise<string> {
  const response = await axios.delete<string>(
    `${API_BASE_URL}/api/candidate/me/education/${educationId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
}