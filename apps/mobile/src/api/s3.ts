import { apiClient } from './config';
import axios from 'axios';
import { API_BASE_URL } from '../lib/api-base';

export interface PresignedUploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
}

export interface GenerateUploadUrlPayload {
  fileName: string;
  fileType: string;
  folder: 'resumes' | 'avatars' | 'banners';
}

export interface UploadFileResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  folder: string;
  uploadedAt: string;
}

export async function generatePresignedUploadUrl(
  payload: GenerateUploadUrlPayload
): Promise<PresignedUploadUrlResponse> {
  const response = await apiClient.post<PresignedUploadUrlResponse>(
    '/s3/presigned-upload',
    payload
  );
  return response.data;
}

export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: Blob,
  contentType?: string
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': contentType,
    },
  });
}

export async function uploadFile(
  file: Blob,
  fileName: string,
  fileType: string,
  folder: 'resumes' | 'avatars' | 'banners' = 'resumes'
): Promise<UploadFileResult> {
  const uploadMeta = await generatePresignedUploadUrl({
    fileName,
    fileType,
    folder,
  });

  await uploadFileToPresignedUrl(uploadMeta.uploadUrl, file, fileType);

  // Get file size
  const fileSize = file.size || 0;

  return {
    fileKey: uploadMeta.fileKey,
    fileUrl: uploadMeta.fileUrl,
    fileName,
    fileSize,
    folder,
    uploadedAt: new Date().toISOString(),
  };
}
