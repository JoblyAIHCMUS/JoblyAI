import axios from 'axios';
import type { CandidateProfileResponse } from '@/api-client/candidate/types';
import { CandidateEducation } from '@/types/profile';

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

export async function updateCandidateProfile(
  updateDto: Partial<CandidateEducation>
): Promise<CandidateEducation> {
  const response = await axios.patch<CandidateEducation>(
    `${API_BASE_URL}/api/candidate/me/education`,
    updateDto,
    {
      withCredentials: true,
    }
  );

  return response.data;
}
