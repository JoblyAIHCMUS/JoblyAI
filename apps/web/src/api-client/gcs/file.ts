import axios from 'axios';
import { DeleteFilePayload, DeleteFileResponse } from '@/api-client/gcs/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function deleteGcsFile(
  payload: DeleteFilePayload
): Promise<DeleteFileResponse> {
  const response = await axios.delete<DeleteFileResponse>(
    `${API_BASE_URL}/api/gcs/file`,
    {
      data: payload,
      withCredentials: true,
    }
  );

  return response.data;
}
