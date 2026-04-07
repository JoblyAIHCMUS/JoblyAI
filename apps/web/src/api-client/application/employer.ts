import axios from 'axios';
import {
  ApplicationRecord,
  EmployerApplicationsQuery,
  PaginatedApplicationsResponse,
  RejectApplicationPayload,
} from '@/api-client/application/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function listEmployerApplications(
  query?: EmployerApplicationsQuery
): Promise<PaginatedApplicationsResponse> {
  const response = await axios.get<PaginatedApplicationsResponse>(
    `${API_BASE_URL}/api/employers/applications`,
    {
      params: query,
      withCredentials: true,
    }
  );
  return response.data;
}

export async function getEmployerApplicationById(
  id: number
): Promise<ApplicationRecord> {
  const response = await axios.get<ApplicationRecord>(
    `${API_BASE_URL}/api/employers/applications/${id}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
}

export async function shortlistEmployerApplication(
  id: number
): Promise<ApplicationRecord> {
  const response = await axios.patch<ApplicationRecord>(
    `${API_BASE_URL}/api/employers/applications/${id}/shortlist`,
    undefined,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  return response.data;
}

export async function rejectEmployerApplication(
  id: number,
  payload: RejectApplicationPayload
): Promise<ApplicationRecord> {
  const response = await axios.patch<ApplicationRecord>(
    `${API_BASE_URL}/api/employers/applications/${id}/reject`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  return response.data;
}

export async function moveToOfferEmployerApplication(
  id: number
): Promise<ApplicationRecord> {
  const response = await axios.patch<ApplicationRecord>(
    `${API_BASE_URL}/api/employers/applications/${id}/offer`,
    undefined,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );
  return response.data;
}
