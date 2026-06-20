'use client';

import { ImageIcon, X } from 'lucide-react';
import * as React from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { FileUpload, FileUploadDropzone } from '@/components/ui/file-upload';
import { deleteGcsFile } from '@/api-client/gcs/file';

// Match backend ALLOWED_FILE_TYPES for LOGOS: ['image/jpeg', 'image/png', 'image/svg+xml']
const ACCEPT = '.svg,.png,.jpg,.jpeg';
const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

interface LogoUploaderProps {
  onValueChange?: (
    logoUrl: string | null,
    file?: File | null,
    fileKey?: string | null
  ) => void;
  onFileSelected?: (file: File) => void;
  onUploadSuccess?: () => void;
  onUploadFile?: (file: File) => Promise<{ url: string; fileKey: string }>;
  currentFileKey?: string | null;
}

export interface LogoUploaderHandle {
  resetPreview: () => void;
}

export const LogoUploader = forwardRef<LogoUploaderHandle, LogoUploaderProps>(
  function LogoUploader(
    {
      onValueChange: onValueChangeProp,
      onFileSelected,
      onUploadSuccess,
      onUploadFile,
      currentFileKey,
    },
    ref
  ) {
    const [preview, setPreview] = React.useState<string | null>(null);
    const [files, setFiles] = React.useState<File[]>([]);
    const previewRef = React.useRef<string | null>(null);

    // Expose resetPreview method to parent
    useImperativeHandle(ref, () => ({
      resetPreview: () => {
        setFiles([]);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        previewRef.current = null;
      },
    }));

    const handleValueChange = React.useCallback(
      (newFiles: File[]) => {
        if (newFiles.length > 0) {
          const file = newFiles[newFiles.length - 1];
          setFiles([file]);
          const url = URL.createObjectURL(file);
          setPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
          previewRef.current = url;
          // Trigger onFileSelected callback if provided
          onFileSelected?.(file);
        } else {
          setFiles([]);
          setPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          previewRef.current = null;
        }
      },
      [onFileSelected]
    );

    const handleRemove = React.useCallback(() => {
      // Remove: delete previous logo if exists
      if (currentFileKey) {
        deleteGcsFile({ fileKey: currentFileKey }).catch(() => {
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
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        {/* Preview */}
        <div className="relative shrink-0">
          <div
            className="flex items-center justify-center overflow-hidden rounded-[var(--radius-xl)]"
            style={{
              width: 100,
              height: 100,
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
                className="size-6 sm:size-8"
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
                      await deleteGcsFile({ fileKey: currentFileKey });
                    } catch {
                      /* ignore GCS delete error */
                    }
                  }
                  onValueChangeProp?.(result.url, file, result.fileKey);
                  options?.onSuccess?.(file);
                } catch (err) {
                  onValueChangeProp?.(null, file, null);
                  options?.onError?.(file, err as Error);
                }
              } else {
                // If no upload handler provided, just mark as success
                // The onFileSelected callback will have been triggered
                options?.onSuccess?.(file);
              }
            }
          }}
          className="flex-1 min-w-0"
        >
          <FileUploadDropzone
            className="cursor-pointer flex-col items-center justify-center gap-1 px-3 sm:px-6 py-4 sm:py-6 bg-[var(--bg-primary)] hover:bg-[var(--bg-accent-primary)]"
            style={{
              borderColor: 'var(--border-accent-primary)',
            }}
          >
            <ImageIcon
              className="size-5 sm:size-6 mb-1"
              style={{ color: 'var(--icon-accent-primary)' }}
            />
            <p
              className="body-body-2-medium text-xs sm:text-sm"
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
              className="body-body-3-regular text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              SVG, PNG, JPG or WEBP (max. 10 MB)
            </p>
          </FileUploadDropzone>
        </FileUpload>
      </div>
    );
  }
);
