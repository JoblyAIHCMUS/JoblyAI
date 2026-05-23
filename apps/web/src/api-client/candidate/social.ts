import axios from 'axios';
import type {
  CandidateSocial,
  CreateSocialPayload,
  UpdateSocialPayload,
} from '@/api-client/candidate/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * CREATE SOCIAL LINK
 */
export async function createSocial(
  payload: CreateSocialPayload
): Promise<CandidateSocial> {
  const response = await axios.post<CandidateSocial>(
    `${API_BASE_URL}/api/candidate/me/socials`,
    payload,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

/**
 * UPDATE SOCIAL LINK
 */
export async function updateSocial(
  payload: UpdateSocialPayload
): Promise<CandidateSocial> {
  const response = await axios.patch<CandidateSocial>(
    `${API_BASE_URL}/api/candidate/me/socials`,
    payload,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

/**
 * DELETE SOCIAL LINK
 */
export async function deleteSocial(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/api/candidate/me/socials/${id}`, {
    withCredentials: true,
  });
}
