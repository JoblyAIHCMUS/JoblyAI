import axios from 'axios';
import {
  ApplicationRecord,
  CandidateApplicationsQuery,
  CreateApplicationPayload,
  PaginatedApplicationsResponse,
} from '@/api-client/application/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function listCandidateApplications(
  query?: CandidateApplicationsQuery
): Promise<PaginatedApplicationsResponse> {
  const response = await axios.get<PaginatedApplicationsResponse>(
    `${API_BASE_URL}/api/applications`,
    {
      params: query,
      withCredentials: true,
    }
  );
  return response.data;
}

export async function getCandidateApplicationById(
  id: number
): Promise<ApplicationRecord> {
  const response = await axios.get<ApplicationRecord>(
    `${API_BASE_URL}/api/applications/${id}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}

export async function createApplication(
  payload: CreateApplicationPayload
): Promise<ApplicationRecord> {
  const response = await axios.post<ApplicationRecord>(
    `${API_BASE_URL}/api/applications`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  return response.data;
}

export async function withdrawCandidateApplication(
  id: number
): Promise<ApplicationRecord> {
  const response = await axios.patch<ApplicationRecord>(
    `${API_BASE_URL}/api/applications/${id}`,
    undefined,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  return response.data;
}
