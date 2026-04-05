import axios from 'axios';

interface UpdateAvatarPayload {
  fileKey: string; // S3 object key (e.g., "assets/avatars/uuid.jpg")
  fileUrl: string; // S3 public URL
}

interface UpdateAvatarResponse {
  id: string;
  email: string;
  avatarUrl: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Update employer avatar
 *
 * Flow:
 * 1. Frontend generates presigned upload URL from S3 service
 * 2. Frontend uploads file directly to S3
 * 3. Frontend calls this API with fileKey and fileUrl
 * 4. Backend updates DB and deletes old avatar from S3
 *
 * @param payload - UpdateAvatarPayload with fileKey and fileUrl
 * @returns Updated user object with new avatarUrl
 */
export async function updateAvatar(
  payload: UpdateAvatarPayload
): Promise<UpdateAvatarResponse> {
  const response = await axios.patch<UpdateAvatarResponse>(
    `${API_BASE_URL}/api/employer/me/avatar`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export type { UpdateAvatarPayload, UpdateAvatarResponse };
