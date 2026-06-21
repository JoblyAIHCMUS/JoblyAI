export interface GcsPresignedUploadUrl {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
  expiresIn: number;
}

export interface GcsPresignedDownloadUrl {
  downloadUrl: string;
  expiresIn: number;
}

export enum GcsFolder {
  RESUMES = 'resumes',
  AVATARS = 'avatars',
  LOGOS = 'logos',
}

export const GCS_KEY_PREFIX_BY_FOLDER: Record<GcsFolder, string> = {
  [GcsFolder.RESUMES]: 'resumes',
  [GcsFolder.AVATARS]: 'assets/avatars',
  [GcsFolder.LOGOS]: 'assets/logos',
};

export const ALLOWED_FILE_TYPES: Record<GcsFolder, string[]> = {
  [GcsFolder.RESUMES]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [GcsFolder.AVATARS]: ['image/jpeg', 'image/png', 'image/webp'],
  [GcsFolder.LOGOS]: ['image/jpeg', 'image/png', 'image/svg+xml'],
};
