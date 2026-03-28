import axios from 'axios';
import type { CandidateProfileResponse } from '@/api-client/candidate/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getCandidateProfile(): Promise<CandidateProfileResponse> {
  const response = await axios.get<CandidateProfileResponse>(
    `${API_BASE_URL}/api/candidate/me`,
    {
      withCredentials: true,
    }
  );

  return response.data;
}