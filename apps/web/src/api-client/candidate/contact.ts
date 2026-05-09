import axios from 'axios';
import type {
  CandidateContact,
  CreateContactPayload,
  UpdateContactPayload,
} from '@/api-client/candidate/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * CREATE CONTACT
 */
export async function createContact(
  payload: CreateContactPayload
): Promise<CandidateContact> {
  const response = await axios.post<CandidateContact>(
    `${API_BASE_URL}/api/candidate/me/contacts`,
    payload,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

/**
 * UPDATE CONTACT
 */
export async function updateContact(
  payload: UpdateContactPayload
): Promise<CandidateContact> {
  const response = await axios.patch<CandidateContact>(
    `${API_BASE_URL}/api/candidate/me/contacts`,
    payload,
    {
      withCredentials: true,
    }
  );

  return response.data;
}

/**
 * DELETE CONTACT
 */
export async function deleteContact(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/api/candidate/me/contacts/${id}`, {
    withCredentials: true,
  });
}
