'use client';

import React, { useRef, ChangeEvent, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CVProps {
  cvUrl?: string;
  cvFileName?: string;
  onCVChange: (file: File) => void;
  disabled?: boolean;
}

export default function CV({
  cvUrl,
  cvFileName = 'Resume.pdf',
  onCVChange,
  disabled = false,
}: CVProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onCVChange(file);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      onCVChange(file);
    }
  };

  const handleDownload = () => {
    if (cvUrl) {
      const link = document.createElement('a');
      link.href = cvUrl;
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

      {/* Current CV Display and Upload Area */}
      <div className="flex justify-start items-start gap-8">
        {/* Current CV Display */}
        {cvUrl ? (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-[#64748B] font-normal font-['Be_Vietnam_Pro']">
              Current CV
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors"
            >
              <FileText size={20} className="text-[#475569]" />
              <span className="text-base font-semibold text-[#0F172A] font-['Be_Vietnam_Pro']">
                {cvFileName}
              </span>
              <Download size={18} className="text-[#64748B] ml-2" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-[#64748B] font-normal font-['Be_Vietnam_Pro']">
              No CV uploaded
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'cursor-pointer px-10 py-6 rounded-[10px] border-2 border-dashed transition-all flex-1',
            dragActive
              ? 'border-[#4338CA] bg-[#F0F4FF] opacity-100'
              : 'border-[#E2E8F0] bg-[#F8FAFC]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />

          {/* Icon and Text */}
          <div className="flex flex-col justify-start items-center gap-2.5">
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

            {/* Text */}
            <div className="flex flex-col justify-start items-center gap-1">
              <div className="flex justify-center text-center gap-1">
                <span className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-[#64748B]">
                  Click to upload new CV/Resume
                </span>
                <span className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-[#0F172A]">
                  {' '}
                  or drag and drop
                </span>
              </div>
              <div className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-[#94A3B8]">
                PDF only (max. 5 MB)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="w-full font-['Be_Vietnam_Pro'] text-sm font-normal leading-5 text-[#64748B]">
        Upload your CV or resume in PDF format. This helps recruiters quickly
        review your qualifications.
      </div>
    </div>
  );
}
