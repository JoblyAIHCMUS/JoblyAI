import { apiClient } from './config';
import { EmployerProfileResponse } from '../types/employer';

export interface EmployerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export interface SearchEmployersParams {
  name?: string;
  email?: string;
  offset?: number;
  limit?: number;
}

export async function getEmployerProfile(): Promise<EmployerProfileResponse> {
  const response = await apiClient.get<EmployerProfileResponse>('/employer/me');
  return response.data;
}

export async function searchEmployers({
  name,
  email,
  offset = 0,
  limit = 5,
}: SearchEmployersParams): Promise<EmployerSearchResult[]> {
  const normalizedName = name?.trim();
  const normalizedEmail = email?.trim();

  if (!normalizedName && !normalizedEmail) {
    return [];
  }

  const response = await apiClient.get<EmployerSearchResult[]>(
    '/employer/search',
    {
      params: {
        name: normalizedName,
        email: normalizedEmail,
        offset,
        limit,
      },
    }
  );

  return response.data;
}

// --- Avatar ---

export interface UpdateAvatarPayload {
  fileKey: string;
  fileUrl: string;
}

export async function updateAvatar(
  payload: UpdateAvatarPayload
): Promise<{ avatarUrl: string }> {
  const response = await apiClient.patch<{ avatarUrl: string }>(
    '/employer/me/avatar',
    payload
  );
  return response.data;
}

export async function deleteAvatar(): Promise<void> {
  await apiClient.delete('/employer/me/avatar');
}
