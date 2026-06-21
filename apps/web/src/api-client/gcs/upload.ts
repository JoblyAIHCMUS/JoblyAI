import axios from 'axios';
import {
  GenerateUploadUrlPayload,
  PresignedUploadUrlResponse,
  GcsFolder,
  UploadFileResult,
} from '@/api-client/gcs/types';
import { validateGcsFile } from '@/api-client/gcs/validate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function generatePresignedUploadUrl(
  payload: GenerateUploadUrlPayload
): Promise<PresignedUploadUrlResponse> {
  const response = await axios.post<PresignedUploadUrlResponse>(
    `${API_BASE_URL}/api/gcs/presigned-upload`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    }
  );

  return response.data;
}

export async function uploadFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType?: string
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': contentType ?? file.type,
    },
  });
}

export async function uploadFile(
  file: File,
  folder: GcsFolder = 'resumes'
): Promise<UploadFileResult> {
  const validation = validateGcsFile(file, folder);
  if (!validation.valid) {
    throw new Error(validation.message || 'Invalid file for GCS upload.');
  }

  const uploadMeta = await generatePresignedUploadUrl({
    fileName: file.name,
    fileType: file.type,
    folder,
  });

  await uploadFileToPresignedUrl(uploadMeta.uploadUrl, file, file.type);

  return {
    fileKey: uploadMeta.fileKey,
    fileUrl: uploadMeta.fileUrl,
    fileName: file.name,
    fileSize: file.size,
    folder,
    uploadedAt: new Date().toISOString(),
  };
}
