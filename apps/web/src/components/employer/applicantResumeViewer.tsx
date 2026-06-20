'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import { useCreateDownloadUrl } from '@/api-hook/gcs';

interface ApplicantResumeViewerProps {
  fileKey: string; // S3 file key for the resume
  fileName?: string;
}

const ApplicantResumeViewer: React.FC<ApplicantResumeViewerProps> = ({
  fileKey,
  fileName = 'Resume.pdf',
}) => {
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);

  const { createDownloadUrl } = useCreateDownloadUrl();

  const generateUrl = useCallback(async () => {
    if (!fileKey) {
      setPresignedUrl(null);
      return;
    }

    setUrlLoading(true);
    try {
      const response = await createDownloadUrl({ fileKey });
      setPresignedUrl(response.downloadUrl);
    } catch (error) {
      console.error('Failed to generate presigned URL:', error);
      setPresignedUrl(null);
    } finally {
      setUrlLoading(false);
    }
  }, [fileKey, createDownloadUrl]);

  useEffect(() => {
    generateUrl();
  }, [generateUrl]);

  const handleDownload = () => {
    if (presignedUrl) {
      const link = document.createElement('a');
      link.href = presignedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="rounded-lg sm:rounded-[10px] border border-[#CBD5E1] bg-white p-3 sm:p-6 flex flex-col gap-3 sm:gap-4">
      {/* Header */}
      <div className="text-lg sm:text-xl font-semibold text-[#0F172A] font-['Lexend_Deca']">
        Candidate CV/Resume
      </div>

      {/* PDF Embed Viewer */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div
          className="w-full rounded-lg border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]"
          style={{ height: 'clamp(250px, 50vh, 500px)' }}
        >
          {urlLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#4338CA]"></div>
            </div>
          ) : presignedUrl ? (
            <embed
              src={presignedUrl}
              type="application/pdf"
              width="100%"
              height="100%"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-[#64748B] text-sm sm:text-base">
                Failed to load PDF
              </p>
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={urlLoading || !presignedUrl}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base"
        >
          <Download
            size={16}
            className="sm:w-5 sm:h-5 text-[#475569] flex-shrink-0"
          />
          <span className="font-semibold text-[#0F172A] font-['Be_Vietnam_Pro']">
            Download Resume
          </span>
        </button>
      </div>

      {/* Helper Text */}
      <div className="w-full font-['Be_Vietnam_Pro'] text-xs sm:text-sm font-normal leading-5 text-[#64748B]">
        View and download the candidate's resume in PDF format.
      </div>
    </div>
  );
};

export default ApplicantResumeViewer;
