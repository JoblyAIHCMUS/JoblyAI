import { apiClient } from './config';

export interface CreateDownloadUrlPayload {
  fileKey: string;
  expiresIn?: number;
}

export interface PresignedDownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
}

/**
 * Get a short-lived presigned URL for downloading an S3 object.
 * Mirrors apps/web/src/api-client/s3/download.ts::generatePresignedDownloadUrl.
 * Used by the applicant-detail screen to view or download a candidate's resume.
 */
export async function createDownloadUrl(
  payload: CreateDownloadUrlPayload
): Promise<PresignedDownloadUrlResponse> {
  const response = await apiClient.post<PresignedDownloadUrlResponse>(
    '/s3/presigned-download',
    payload
  );
  return response.data;
}
