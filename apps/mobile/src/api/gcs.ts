import { apiClient } from './config';

export interface CreateDownloadUrlPayload {
  fileKey: string;
  expiresIn?: number;
}

export interface PresignedDownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
}

export type GcsFolder = 'resumes' | 'avatars' | 'logos';

export interface CreateUploadUrlPayload {
  fileName: string;
  fileType: string;
  folder: GcsFolder;
}

export interface PresignedUploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
  expiresIn: number;
}

export interface UploadResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  folder: GcsFolder;
  uploadedAt: Date;
}

/**
 * Get a short-lived presigned URL for downloading a GCS object.
 * Mirrors apps/web/src/api-client/gcs/download.ts::generatePresignedDownloadUrl.
 * Used by the applicant-detail screen to view or download a candidate's resume.
 */
export async function createDownloadUrl(
  payload: CreateDownloadUrlPayload
): Promise<PresignedDownloadUrlResponse> {
  const response = await apiClient.post<PresignedDownloadUrlResponse>(
    '/gcs/presigned-download',
    payload
  );
  return response.data;
}

/**
 * Get a presigned upload URL for uploading a file to GCS.
 * Mirrors apps/web/src/api-client/gcs/upload.ts::generatePresignedUploadUrl.
 */
export async function createUploadUrl(
  payload: CreateUploadUrlPayload
): Promise<PresignedUploadUrlResponse> {
  const response = await apiClient.post<PresignedUploadUrlResponse>(
    '/gcs/presigned-upload',
    payload
  );
  return response.data;
}

/**
 * Upload a file to a presigned GCS URL.
 * Mirrors apps/web/src/api-client/gcs/upload.ts::uploadFileToPresignedUrl.
 */
export async function uploadFileToGcs(
  uploadUrl: string,
  file: Blob,
  fileType: string
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': fileType },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`GCS upload failed with status ${response.status}`);
  }
}

/**
 * Delete a file from GCS.
 * Mirrors apps/web/src/api-client/gcs/file.ts::deleteGcsFile.
 */
export async function deleteGcsFile(fileKey: string): Promise<void> {
  await apiClient.delete('/gcs/file', { data: { fileKey } });
}
