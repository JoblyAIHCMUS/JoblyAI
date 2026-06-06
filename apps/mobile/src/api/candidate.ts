import { apiClient } from './config';
import type {
  CandidateProfileResponse,
  CandidateResume,
  CreateResumePayload,
} from '../types/candidate';

export interface ApiOptions {
  signal?: AbortSignal;
}

export async function getCandidateProfile(): Promise<CandidateProfileResponse> {
  const response = await apiClient.get<CandidateProfileResponse>(
    '/candidate/me'
  );
  return response.data;
}

export async function createResume(
  payload: CreateResumePayload,
  options?: ApiOptions
): Promise<CandidateResume> {
  const response = await apiClient.post<CandidateResume>(
    '/candidate/me/resume',
    payload,
    { signal: options?.signal }
  );
  return response.data;
}

export async function deleteResume(
  resumeId: number,
  keepData = false,
  options?: ApiOptions
): Promise<string> {
  const response = await apiClient.delete<string>(
    `/candidate/me/resume/${resumeId}?keepData=${keepData}`,
    { signal: options?.signal }
  );
  return response.data;
}

export async function getCandidateResumes(
  options?: ApiOptions
): Promise<CandidateResume[]> {
  const response = await apiClient.get<CandidateResume[]>(
    '/candidate/me/resumes',
    { signal: options?.signal }
  );
  return response.data;
}
