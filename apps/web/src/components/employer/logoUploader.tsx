'use client';

import { ImageIcon, X } from 'lucide-react';
import * as React from 'react';
import { FileUpload, FileUploadDropzone } from '@/components/ui/file-upload';

const ACCEPT = '.svg,.png,.jpg,.jpeg,.webp';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface LogoUploaderProps {
  onValueChange?: (logoUrl: string | null, file?: File | null) => void;
  onUploadFile?: (file: File) => Promise<string>;
}

export function LogoUploader({
  onValueChange: onValueChangeProp,
  onUploadFile,
}: LogoUploaderProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const previewRef = React.useRef<string | null>(null);

  // Token to track the latest file selection and ignore stale upload results
  const uploadTokenRef = React.useRef(0);

  const handleValueChange = React.useCallback(
    async (newFiles: File[]) => {
      if (newFiles.length > 0) {
        const file = newFiles[newFiles.length - 1];
        setFiles([file]);
        // Increment token for each new file selection
        const myToken = ++uploadTokenRef.current;
        let logoUrl: string | null = null;
        if (onUploadFile) {
          try {
            const result = await onUploadFile(file);
            // Only use result if this is the latest selection
            if (uploadTokenRef.current === myToken) {
              logoUrl = result;
            } else {
              // Stale upload, ignore
              return;
            }
          } catch {
            if (uploadTokenRef.current !== myToken) return; // Ignore stale
            logoUrl = null;
          }
        }
        if (uploadTokenRef.current !== myToken) return; // Ignore stale
        onValueChangeProp?.(logoUrl, file);
        const url = URL.createObjectURL(file);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        previewRef.current = url;
      } else {
        // Clear token for no file
        uploadTokenRef.current++;
        setFiles([]);
        onValueChangeProp?.(null, null);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        previewRef.current = null;
      }
    },
    [onValueChangeProp, onUploadFile]
  );

  const handleRemove = React.useCallback(() => {
    setFiles([]);
    onValueChangeProp?.(null, null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    previewRef.current = null;
  }, [onValueChangeProp]);

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
