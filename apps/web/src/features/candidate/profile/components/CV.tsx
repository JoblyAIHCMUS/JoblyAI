'use client';

import React, { useRef, ChangeEvent, useState, useEffect, useCallback } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateDownloadUrl } from '@/api-hook/s3';

interface CVProps {
  cvFileKey?: string; // S3 file key for the resume
  cvFileName?: string;
  onCVChange: (file: File) => Promise<void>;
  disabled?: boolean;
  isUploading?: boolean;
  uploadError?: string | null;
}

export default function CV({
  cvFileKey,
  cvFileName = 'Resume.pdf',
  onCVChange,
  disabled = false,
  isUploading = false,
  uploadError = null,
}: CVProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  const { createDownloadUrl } = useCreateDownloadUrl();

  const generateUrl = useCallback(async () => {
    if (!cvFileKey) {
      setPresignedUrl(null);
      return;
    }

    setUrlLoading(true);
    try {
      const response = await createDownloadUrl({ fileKey: cvFileKey });
      setPresignedUrl(response.downloadUrl);
    } catch (error) {
      console.error('Failed to generate presigned URL:', error);
      setPresignedUrl(null);
    } finally {
      setUrlLoading(false);
    }
  }, [cvFileKey, createDownloadUrl]);

  useEffect(() => {
    generateUrl();
  }, [generateUrl]);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        await onCVChange(file);
      } catch (error) {
        console.error('Failed to upload resume:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        await onCVChange(file);
      } catch (error) {
        console.error('Failed to upload resume:', error);
      }
    }
  };

  const handleDownload = () => {
    if (presignedUrl) {
      const link = document.createElement('a');
      link.href = presignedUrl;
      link.download = cvFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="rounded-[10px] border border-[#CBD5E1] bg-white p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="text-xl font-semibold text-[#0F172A] font-['Lexend_Deca']">
        CV/Resume
      </div>

      {/* When CV exists - Show Viewer */}
      {cvFileKey && (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-[#64748B] font-normal font-['Be_Vietnam_Pro']">
            Your Current CV
          </div>
          {/* PDF Embed Viewer */}
          <div
            className="w-full rounded-lg border border-[#E2E8F0] overflow-hidden"
            style={{ height: '400px' }}
          >
            {urlLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4338CA]"></div>
              </div>
            ) : presignedUrl ? (
              <embed
                src={presignedUrl}
                type="application/pdf"
                width="100%"
                height="100%"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC]">
                <p className="text-[#64748B]">Failed to load PDF</p>
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors"
          >
            <Download size={18} className="text-[#475569]" />
            <span className="text-base font-semibold text-[#0F172A] font-['Be_Vietnam_Pro']">
              Download Current CV
            </span>
          </button>
        </div>
      )}

      {/* Upload Area - Always Show */}
      <div className="flex flex-col gap-3">
        {cvFileKey && (
          <div className="text-sm text-[#64748B] font-normal font-['Be_Vietnam_Pro']">
            Upload a new CV to replace the current one
          </div>
        )}

        {/* Upload Area */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'cursor-pointer px-10 py-6 rounded-[10px] border-2 border-dashed transition-all',
            dragActive
              ? 'border-[#4338CA] bg-[#F0F4FF] opacity-100'
              : 'border-[#E2E8F0] bg-[#F8FAFC]',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {/* Icon and Text */}
          <div className="flex flex-col justify-start items-center gap-2.5">
            {isUploading ? (
              <div className="size-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4338CA]"></div>
              </div>
            ) : (
              <div className="size-8 relative overflow-hidden">
                <svg
                  className="size-8 text-[#94A3B8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"
                  />
                </svg>
              </div>
            )}

            {/* Text */}
            <div className="flex flex-col justify-start items-center gap-1">
              {isUploading ? (
                <div className="text-base font-normal text-[#4338CA] font-['Be_Vietnam_Pro']">
                  Uploading...
                </div>
              ) : (
                <>
                  <div className="flex justify-center text-center gap-1">
                    <span className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-[#64748B]">
                      Click to upload
                    </span>
                    <span className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-[#0F172A]">
                      {' '}
                      or drag and drop
                    </span>
                  </div>
                  <div className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-[#94A3B8]">
                    PDF only (max. 5 MB)
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <span className="text-sm font-medium text-red-700">
            {uploadError}
          </span>
        </div>
      )}

      {/* Helper Text */}
      <div className="w-full font-['Be_Vietnam_Pro'] text-sm font-normal leading-5 text-[#64748B]">
        Upload your CV or resume in PDF format. This helps recruiters quickly
        review your qualifications.
      </div>
    </div>
  );
}
