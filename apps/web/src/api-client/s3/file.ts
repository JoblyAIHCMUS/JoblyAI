import axios from 'axios';
import { DeleteFilePayload, DeleteFileResponse } from '@/api-client/s3/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function deleteS3File(
  payload: DeleteFilePayload
): Promise<DeleteFileResponse> {
  const response = await axios.delete<DeleteFileResponse>(
    `${API_BASE_URL}/api/s3/file`,
    {
      data: payload,
      withCredentials: true,
    }
  );

  return response.data;
}
