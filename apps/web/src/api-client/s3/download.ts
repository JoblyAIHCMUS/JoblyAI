import axios from 'axios';
import {
  GenerateDownloadUrlPayload,
  PresignedDownloadUrlResponse,
} from '@/api-client/s3/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function generatePresignedDownloadUrl(
  payload: GenerateDownloadUrlPayload
): Promise<PresignedDownloadUrlResponse> {
  const response = await axios.post<PresignedDownloadUrlResponse>(
    `${API_BASE_URL}/api/s3/presigned-download`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}
