'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

export interface ResumeChoice {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ResumeSectionProps {
  resumes: ResumeChoice[];
  selectedResumeId: number | null;
  selectedResume?: ResumeChoice | null;
  uploadedFile: File | null;
  onSelect: (resumeId: number) => void;
  onDelete: (resumeId: number) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  deletingResume: boolean;
  candidateProfileError: string | null;
  canUploadNewResume: boolean;
  maxResumes: number;
}

const formatResumeSize = (size?: number) => {
  if (!size) return '';

  const megabytes = size / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }

  const kilobytes = size / 1024;
  return `${Math.max(1, Math.round(kilobytes))} KB`;
};

const formatResumeDate = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function ResumeSection({
  resumes,
  selectedResumeId,
  selectedResume,
  uploadedFile,
  onSelect,
  onDelete,
  onUpload,
  loading,
  uploading,
  uploadProgress,
  deletingResume,
  candidateProfileError,
  canUploadNewResume,
  maxResumes,
}: ResumeSectionProps) {
  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-semibold text-slate-950">
          Use your recent resumes
        </label>
        {selectedResume ? (
          <a
            href={selectedResume.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View
          </a>
        ) : null}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Loading your recent resumes...
          </div>
        ) : resumes.length > 0 ? (
          resumes.map((resume, index) => {
            const isSelected = resume.id === selectedResumeId;

            return (
              <div
                key={resume.id}
                className={`flex flex-col gap-3 rounded-lg border px-3 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-4 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(resume.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="min-w-0 break-words text-sm font-semibold leading-5 text-slate-950">
                      {resume.fileName}
                    </span>
                    {index === 0 && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="mt-1 break-words text-[11px] leading-4 text-slate-500 sm:text-xs">
                    {[
                      formatResumeDate(resume.updatedAt || resume.createdAt),
                      resume.fileType,
                      formatResumeSize(resume.fileSize),
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </button>

                <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:justify-start">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(resume.id)}
                    disabled={deletingResume || uploading}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Delete ${resume.fileName}`}
                    title="Delete resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No uploaded resumes yet.
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <label className="text-sm font-semibold text-slate-950">
          Attach a new resume
        </label>
        <label
          className={`flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-colors sm:w-auto sm:px-6 sm:py-4 ${
            canUploadNewResume
              ? 'cursor-pointer border-indigo-400 bg-indigo-50 hover:border-indigo-500 hover:bg-indigo-100'
              : 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400'
          }`}
        >
          <svg
            className={`h-5 w-5 shrink-0 sm:h-6 sm:w-6 ${
              canUploadNewResume ? 'text-indigo-600' : 'text-slate-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="min-w-0 break-words text-center font-medium text-slate-950">
            {uploadedFile
              ? uploadedFile.name
              : canUploadNewResume
              ? 'Attach Resume/CV'
              : 'Resume limit reached'}
          </span>
          <input
            type="file"
            onChange={onUpload}
            accept=".pdf,.doc,.docx"
            className="hidden"
            disabled={uploading || !canUploadNewResume}
            aria-label="Upload resume file"
          />
        </label>
      </div>

      <p className="mt-2 text-[11px] leading-4 text-slate-500 sm:text-xs">
        You can store up to {maxResumes} resumes.
      </p>

      {uploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-600 sm:text-xs">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(uploadProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {selectedResume && (
        <p className="mt-3 text-[11px] leading-4 text-green-600 sm:text-xs">
          ✓ Resume ready: {selectedResume.fileName}
        </p>
      )}

      {Boolean(candidateProfileError) && (
        <p className="mt-3 text-[11px] leading-4 text-amber-700 sm:text-xs">
          Could not load your resume history, so the latest uploaded file will
          be used.
        </p>
      )}
    </div>
  );
}
