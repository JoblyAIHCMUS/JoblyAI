export type S3Folder = 'resumes' | 'avatars' | 'logos';

export interface GenerateUploadUrlPayload {
  fileName: string;
  fileType: string;
  folder?: S3Folder;
}

export interface PresignedUploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
  expiresIn: number;
}

export interface GenerateDownloadUrlPayload {
  fileKey: string;
  expiresIn?: number;
}

export interface PresignedDownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
}

export interface DeleteFilePayload {
  fileKey: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
}

export interface UploadFileResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  folder: S3Folder;
  uploadedAt: string;
}

export interface S3FileValidationResult {
  valid: boolean;
  code?: 'EMPTY_FILE' | 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE';
  message?: string;
}

export const S3_MAX_FILE_SIZE_BY_FOLDER: Record<S3Folder, number> = {
  resumes: 5 * 1024 * 1024,
  avatars: 2 * 1024 * 1024,
  logos: 1 * 1024 * 1024,
};

export const S3_ALLOWED_FILE_TYPES_BY_FOLDER: Record<S3Folder, string[]> = {
  resumes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  avatars: ['image/jpeg', 'image/png', 'image/webp'],
  logos: ['image/jpeg', 'image/png', 'image/svg+xml'],
};
