import axios from 'axios';
import type {
  EmployerProfileResponse,
  UpdateEmployerProfilePayload,
  UpdateEmployerProfileResponse,
} from '@/api-client/employer/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getEmployerProfile(): Promise<EmployerProfileResponse> {
  const response = await axios.get<EmployerProfileResponse>(
    `${API_BASE_URL}/api/employer/me`,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

export async function updateEmployerProfile(
  updateDto: UpdateEmployerProfilePayload
): Promise<UpdateEmployerProfileResponse> {
  const response = await axios.post<UpdateEmployerProfileResponse>(
    `${API_BASE_URL}/api/employer/me`,
    updateDto,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}