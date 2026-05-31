import { apiClient } from './config';
import type { CandidateProfileResponse } from '../types/candidate';

export async function getCandidateProfile(): Promise<CandidateProfileResponse> {
  const response = await apiClient.get<CandidateProfileResponse>(
    '/candidate/me'
  );
  return response.data;
}
