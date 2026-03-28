import axios from 'axios';
import type {
  CandidateCertificate,
  CreateCertificatePayload,
  UpdateCertificatePayload,
} from '@/api-client/candidate/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createCertificate(
  payload: CreateCertificatePayload
): Promise<CandidateCertificate> {
  const response = await axios.post<CandidateCertificate>(
    `${API_BASE_URL}/api/candidate/me/certification`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function updateCertificate(
  payload: UpdateCertificatePayload
): Promise<CandidateCertificate> {
  const response = await axios.patch<CandidateCertificate>(
    `${API_BASE_URL}/api/candidate/me/certification`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function deleteCertificate(
  certificateId: number
): Promise<string> {
  const response = await axios.delete<string>(
    `${API_BASE_URL}/api/candidate/me/certification/${certificateId}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
}
