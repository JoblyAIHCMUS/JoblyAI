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

// Keep DTO/input folder values stable while routing public assets to dedicated prefixes.
export const S3_KEY_PREFIX_BY_FOLDER: Record<S3Folder, string> = {
  [S3Folder.RESUMES]: 'resumes',
  [S3Folder.AVATARS]: 'assets/avatars',
  [S3Folder.LOGOS]: 'assets/logos',
};

export const ALLOWED_FILE_TYPES: Record<S3Folder, string[]> = {
  [S3Folder.RESUMES]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [S3Folder.AVATARS]: ['image/jpeg', 'image/png', 'image/webp'],
  [S3Folder.LOGOS]: ['image/jpeg', 'image/png', 'image/svg+xml'],
};
