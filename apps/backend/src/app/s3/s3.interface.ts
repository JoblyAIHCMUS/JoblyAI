
export interface PresignedUploadUrl {
  uploadUrl: string; // URL for frontend to upload file directly to S3
  fileKey: string; // Key of file in S3 ("resumes/abc-123.pdf")
  publicUrl: string; // URL public for accessing the file ("https://bucket.s3.region.amazonaws.com/resumes/abc-123.pdf")
  expiresIn: number; // Expiry time in seconds (e.g. 300 for 5 minutes)
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
