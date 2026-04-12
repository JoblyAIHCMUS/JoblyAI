/**
 * Allowed file types for different upload folders
 * Must match backend ALLOWED_FILE_TYPES from apps/backend/src/app/s3/s3.interface.ts
 */

export enum UploadFolder {
  RESUMES = 'resumes',
  AVATARS = 'avatars',
  LOGOS = 'logos',
}

export const ALLOWED_FILE_TYPES: Record<UploadFolder, string[]> = {
  [UploadFolder.RESUMES]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [UploadFolder.AVATARS]: ['image/jpeg', 'image/png', 'image/webp'],
  [UploadFolder.LOGOS]: ['image/jpeg', 'image/png', 'image/svg+xml'],
};

export const FILE_TYPE_DISPLAY_NAMES: Record<UploadFolder, string> = {
  [UploadFolder.RESUMES]: 'PDF or Word documents',
  [UploadFolder.AVATARS]: 'JPEG, PNG or WebP images',
  [UploadFolder.LOGOS]: 'JPEG, PNG or SVG images',
};

export function isFileTypeAllowed(
  fileType: string,
  folder: UploadFolder
): boolean {
  return ALLOWED_FILE_TYPES[folder].includes(fileType);
}

export function getFileTypeErrorMessage(folder: UploadFolder): string {
  return `Please select a ${FILE_TYPE_DISPLAY_NAMES[folder]} file`;
}
