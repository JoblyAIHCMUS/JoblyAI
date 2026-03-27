'use client';

import { ImageIcon, X } from 'lucide-react';
import * as React from 'react';
import { FileUpload, FileUploadDropzone } from '@/components/ui/file-upload';
import { deleteS3File } from '@/api-client/s3/file';

const ACCEPT = '.svg,.png,.jpg,.jpeg,.webp';
const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

interface LogoUploaderProps {
  onValueChange?: (
    logoUrl: string | null,
    file?: File | null,
    fileKey?: string | null
  ) => void;
  onUploadFile?: (file: File) => Promise<{ url: string; fileKey: string }>;
  currentFileKey?: string | null;
}

export function LogoUploader({
  onValueChange: onValueChangeProp,
  onUploadFile,
  currentFileKey,
}: LogoUploaderProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const previewRef = React.useRef<string | null>(null);

  const handleValueChange = React.useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      const file = newFiles[newFiles.length - 1];
      setFiles([file]);
      const url = URL.createObjectURL(file);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      previewRef.current = url;
    } else {
      setFiles([]);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      previewRef.current = null;
    }
  }, []);

  const handleRemove = React.useCallback(() => {
    // Remove: delete previous logo if exists
    if (currentFileKey) {
      deleteS3File({ fileKey: currentFileKey }).catch(() => {
        /* ignore error */
      });
    }
    setFiles([]);
    onValueChangeProp?.(null, null, null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    previewRef.current = null;
  }, [currentFileKey, onValueChangeProp]);

  React.useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  return (
    <div className="flex items-start gap-4">
      {/* Preview */}
      <div className="relative shrink-0">
        <div
          className="flex items-center justify-center overflow-hidden rounded-[var(--radius-xl)]"
          style={{
            width: 124,
            height: 124,
            backgroundColor: 'var(--indigo-50)',
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Company logo preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon
              className="size-8"
              style={{ color: 'var(--icon-tertiary)' }}
            />
          )}
        </div>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
            aria-label="Remove logo"
          >
            <X className="size-3.5 text-black" />
          </button>
        )}
      </div>

      {/* Upload zone */}
      <FileUpload
        accept={ACCEPT}
        maxSize={MAX_SIZE}
        value={files}
        onValueChange={handleValueChange}
        onUpload={async (newFiles, options) => {
          // Only upload the latest file
          if (newFiles.length > 0) {
            const file = newFiles[newFiles.length - 1];
            if (onUploadFile) {
              try {
                // Optionally implement progress reporting here if upload API supports it
                // e.g., pass a progress callback to onUploadFile and call options.onProgress(file, percent)
                const result = await onUploadFile(file);
                // Only delete the previous logo after a successful upload
                if (currentFileKey && currentFileKey !== result.fileKey) {
                  try {
                    await deleteS3File({ fileKey: currentFileKey });
                  } catch {
                    /* ignore S3 delete error */
                  }
                }
                onValueChangeProp?.(result.url, file, result.fileKey);
                options?.onSuccess?.(file);
              } catch (err) {
                onValueChangeProp?.(null, file, null);
                options?.onError?.(file, err as Error);
              }
            } else {
              // If no upload handler, treat as error
              options?.onError?.(file, new Error('No upload handler'));
            }
          }
        }}
        className="flex-1"
      >
        <FileUploadDropzone
          className="cursor-pointer flex-col items-center justify-center gap-1 px-6 bg-[var(--bg-primary)] hover:bg-[var(--bg-accent-primary)]"
          style={{
            borderColor: 'var(--border-accent-primary)',
          }}
        >
          <ImageIcon
            className="size-6 mb-1"
            style={{ color: 'var(--icon-accent-primary)' }}
          />
          <p
            className="body-body-2-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            <span
              className="underline"
              style={{ color: 'var(--text-accent-primary)' }}
            >
              Click to replace
            </span>{' '}
            or drag and drop
          </p>
          <p
            className="body-body-3-regular"
            style={{ color: 'var(--text-tertiary)' }}
          >
            SVG, PNG, JPG or WEBP (max. 10 MB)
          </p>
        </FileUploadDropzone>
      </FileUpload>
    </div>
  );
}
