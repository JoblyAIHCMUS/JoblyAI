import { apiClient } from './config';
import { EmployerProfileResponse } from '../types/employer';

export async function getEmployerProfile(): Promise<EmployerProfileResponse> {
  const response = await apiClient.get<EmployerProfileResponse>('/employer/me');
  return response.data;
}
