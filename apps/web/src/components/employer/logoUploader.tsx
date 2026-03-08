'use client';

import { ImageIcon, X } from 'lucide-react';
import * as React from 'react';
import {
  FileUpload,
  FileUploadDropzone,
} from '@/components/ui/file-upload';

const ACCEPT = '.svg,.png,.jpg,.jpeg,.webp';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function LogoUploader() {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);

  const handleValueChange = React.useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      const file = newFiles[newFiles.length - 1];
      setFiles([file]);
      const url = URL.createObjectURL(file);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setFiles([]);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, []);

  const handleRemove = React.useCallback(() => {
    setFiles([]);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
    // Only on unmount
  }, []);

  return (
    <div className="flex items-start gap-4">
      {/* Preview */}
      <div className="relative shrink-0">
        <div
          className="flex items-center justify-center overflow-hidden rounded-[var(--radius-xl)]"
          style={{ width: 124, height: 124, backgroundColor: 'var(--indigo-50)' }}
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
          <p className="body-body-2-medium" style={{ color: 'var(--text-primary)' }}>
            <span
              className="underline"
              style={{ color: 'var(--text-accent-primary)' }}
            >
              Click to replace
            </span>{' '}
            or drag and drop
          </p>
          <p className="body-body-3-regular" style={{ color: 'var(--text-tertiary)' }}>
            SVG, PNG, JPG or WEBP (max. 10 MB)
          </p>
        </FileUploadDropzone>
      </FileUpload>
    </div>
  );
}
