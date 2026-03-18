export interface PresignedUploadUrl {
  uploadUrl: string; // Presigned URL for frontend to upload file directly to S3
  fileKey: string; // S3 object key ("resumes/abc-123.pdf")
  fileUrl: string; // S3 object URL - NOTE: Requires bucket public access or presigned GET URL for viewing
  expiresIn: number; // Upload URL expiry time in seconds (e.g. 300 for 5 minutes)
}

export interface PresignedDownloadUrl {
  downloadUrl: string; // Presigned URL for downloading/viewing the file
  expiresIn: number; // Download URL expiry time in seconds
}

export enum S3Folder {
  RESUMES = 'resumes',
  AVATARS = 'avatars',
  LOGOS = 'logos',
}

export const ALLOWED_FILE_TYPES: Record<S3Folder, string[]> = {
  [S3Folder.RESUMES]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [S3Folder.AVATARS]: ['image/jpeg', 'image/png', 'image/webp'],
  [S3Folder.LOGOS]: ['image/jpeg', 'image/png', 'image/svg+xml'],
};
