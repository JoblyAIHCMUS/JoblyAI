import {
  S3_ALLOWED_FILE_TYPES_BY_FOLDER,
  S3_MAX_FILE_SIZE_BY_FOLDER,
  S3FileValidationResult,
  S3Folder,
} from '@/api-client/s3/types';

function formatFileSize(bytes: number): string {
  const sizeInMb = bytes / (1024 * 1024);
  return `${sizeInMb.toFixed(1)}MB`;
}

export function validateS3File(
  file: File,
  folder: S3Folder
): S3FileValidationResult {
  if (!file || file.size <= 0) {
    return {
      valid: false,
      code: 'EMPTY_FILE',
      message: 'Please choose a non-empty file.',
    };
  }

  const allowedFileTypes = S3_ALLOWED_FILE_TYPES_BY_FOLDER[folder];
  if (!allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: `Invalid file type ${
        file.type || 'unknown'
      } for ${folder}. Allowed: ${allowedFileTypes.join(', ')}`,
    };
  }

  const maxFileSize = S3_MAX_FILE_SIZE_BY_FOLDER[folder];
  if (file.size > maxFileSize) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      message: `File is too large (${formatFileSize(
        file.size
      )}). Maximum for ${folder} is ${formatFileSize(maxFileSize)}.`,
    };
  }

  return { valid: true };
}
