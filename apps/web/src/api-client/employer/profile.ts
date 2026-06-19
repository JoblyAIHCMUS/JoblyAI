import apiClient from '@/lib/api';
import type {
  EmployerProfileResponse,
  UpdateEmployerProfilePayload,
  UpdateEmployerProfileResponse,
} from '@/api-client/employer/types';

export async function getEmployerProfile(): Promise<EmployerProfileResponse> {
  const response = await apiClient.get<EmployerProfileResponse>('/employer/me');
  return response.data;
}

export async function updateEmployerProfile(
  updateDto: UpdateEmployerProfilePayload
): Promise<UpdateEmployerProfileResponse> {
  const response = await apiClient.post<UpdateEmployerProfileResponse>(
    '/employer/me',
    updateDto
  );
  return response.data;
}
