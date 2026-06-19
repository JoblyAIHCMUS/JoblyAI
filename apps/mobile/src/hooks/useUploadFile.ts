import { useCallback, useState } from 'react';
import { createUploadUrl, uploadFileToS3, S3Folder } from '../api/s3';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface UploadFileResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface UseUploadFileOptions {
  onSuccess?: (data: UploadFileResult) => void;
  onError?: (error: unknown) => void;
}

export function useUploadFile(options?: UseUploadFileOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [progress, setProgress] = useState(0);

  const validateFile = useCallback((file: File): string | null => {
    if (!file || file.size === 0) return 'File is empty';
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a PDF or Word document.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 5MB.';
    }
    return null;
  }, []);

  const uploadToS3 = useCallback(
    async (file: File, folder: S3Folder = 'resumes'): Promise<UploadFileResult> => {
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(20);

        const presignedResponse = await createUploadUrl({
          fileName: file.name,
          fileType: file.type,
          folder,
        });

        setProgress(50);

        await uploadFileToS3(presignedResponse.uploadUrl, file, file.type);

        setProgress(90);

        const result: UploadFileResult = {
          fileKey: presignedResponse.fileKey,
          fileUrl: presignedResponse.fileUrl,
          fileName: file.name,
          fileSize: file.size,
        };

        setProgress(100);
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [validateFile, options]
  );

  return { uploadToS3, loading, error, progress };
}
