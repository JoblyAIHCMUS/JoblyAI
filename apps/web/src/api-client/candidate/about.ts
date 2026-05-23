import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface CreateAboutPayload {
  bio?: string;
  title?: string;
}

export interface UpdateAboutPayload {
  id: number;
  bio?: string;
  title?: string;
}

export interface AboutResponse {
  id: number;
  bio?: string;
  title?: string;
}

export async function createCandidateAbout(
  payload: CreateAboutPayload
): Promise<AboutResponse> {
  const response = await axios.post<AboutResponse>(
    `${API_BASE_URL}/api/candidate/me/about`,
    payload,
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
}

export async function updateCandidateAbout(
  payload: UpdateAboutPayload
): Promise<AboutResponse> {
  const response = await axios.patch<AboutResponse>(
    `${API_BASE_URL}/api/candidate/me/about`,
    payload,
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
}
