import { apiClient } from './config';

export interface CreateDownloadUrlPayload {
  fileKey: string;
  expiresIn?: number;
}

export interface PresignedDownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
}

export type S3Folder = 'resumes' | 'avatars' | 'logos';

export interface CreateUploadUrlPayload {
  fileName: string;
  fileType: string;
  folder: S3Folder;
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
  folder: S3Folder;
  uploadedAt: Date;
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

/**
 * Get a presigned upload URL for uploading a file to S3.
 * Mirrors apps/web/src/api-client/s3/upload.ts::generatePresignedUploadUrl.
 */
export async function createUploadUrl(
  payload: CreateUploadUrlPayload
): Promise<PresignedUploadUrlResponse> {
  const response = await apiClient.post<PresignedUploadUrlResponse>(
    '/s3/presigned-upload',
    payload
  );
  return response.data;
}

/**
 * Upload a file to a presigned S3 URL.
 * Mirrors apps/web/src/api-client/s3/upload.ts::uploadFileToPresignedUrl.
 */
export async function uploadFileToS3(
  uploadUrl: string,
  file: Blob,
  fileType: string
): Promise<void> {
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': fileType },
    body: file,
  });
}

/**
 * Delete a file from S3.
 * Mirrors apps/web/src/api-client/s3/file.ts::deleteS3File.
 */
export async function deleteS3File(fileKey: string): Promise<void> {
  await apiClient.delete('/s3/file', { data: { fileKey } });
}
