import axios from 'axios';
import type {
  CreateResumePayload,
  UpdateResumePayload,
} from '@/api-client/candidate/types';
import { CandidateResume } from '@/types/profile';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createResume(
  payload: CreateResumePayload
): Promise<CandidateResume> {
  const response = await axios.post<CandidateResume>(
    `${API_BASE_URL}/api/candidate/me/resume`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function updateResume(
  payload: UpdateResumePayload
): Promise<CandidateResume> {
  const response = await axios.patch<CandidateResume>(
    `${API_BASE_URL}/api/candidate/me/resume`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function deleteResume(resumeId: number): Promise<string> {
  const response = await axios.delete<string>(
    `${API_BASE_URL}/api/candidate/me/resume/${resumeId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
}
