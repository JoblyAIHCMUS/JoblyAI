import axios from 'axios';
import type { EmployerSearchResult } from '@/api-client/employer/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SearchEmployersParams {
  name?: string;
  email?: string;
  offset?: number;
  limit?: number;
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

  const response = await axios.get<EmployerSearchResult[]>(
    `${API_BASE_URL}/api/employer/search`,
    {
      params: {
        name: normalizedName,
        email: normalizedEmail,
        offset,
        limit,
      },
      withCredentials: true,
    }
  );

  return response.data;
}
