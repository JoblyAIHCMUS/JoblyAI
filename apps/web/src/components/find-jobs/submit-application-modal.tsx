'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { ResultDialog } from '@/components/ui/ResultDialog';
import {
  SubmitApplicationSchema,
  SubmitApplicationFormData,
} from '@/lib/validation';
import Link from 'next/link';
import Image from 'next/image';
import { useCreateApplication } from '@/api-hook/application/useCreateApplication';
import { useUploadFile } from '@/api-hook/s3';
import {
  useCreateResume,
  useDeleteResume,
  useGetCandidateProfile,
} from '@/api-hook/candidate';
import type { CandidateResume } from '@/types/candidate';
import { formatJobType } from '@/features/find-jobs/job-detail/job.utils';
import { Dot, Trash2 } from 'lucide-react';

const MAX_RESUMES = 5;

interface ResumeChoice {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface DeleteResultState {
  open: boolean;
  success: boolean;
  title: string;
  description: string;
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

export interface JobApplication {
  id: number;
  title: string;
  company: string;
  location: string | null;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  logoUrl?: string;
  currentResume?: {
    id?: number;
    filename: string;
    url: string;
  };
}

interface SubmitApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobApplication;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export const SubmitApplicationModal = ({
  isOpen,
  onClose,
  job,
  onSuccess,
  onError,
}: SubmitApplicationModalProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [applicationSubmitError, setApplicationSubmitError] = useState<
    string | null
  >(null);
  const [applicationSubmitSuccess, setApplicationSubmitSuccess] = useState<
    string | null
  >(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeOptions, setResumeOptions] = useState<ResumeChoice[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(
    job.currentResume?.id ?? null
  );
  const [resumeDeleteTarget, setResumeDeleteTarget] = useState<ResumeChoice | null>(null);
  const [deleteResult, setDeleteResult] = useState<DeleteResultState | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(SubmitApplicationSchema),
    mode: 'onChange',
    defaultValues: { jobTitle: '', coverLetter: '' },
  });

  const { upload: uploadToS3, loading: uploading } = useUploadFile();
  const {
    fetchCandidateProfile,
    loading: loadingCandidateProfile,
    error: candidateProfileError,
  } = useGetCandidateProfile();

  const { createResumeRecord, loading: creatingResume } = useCreateResume({
    onSuccess: (resumeData: CandidateResume) => {
      const uploadedResume: ResumeChoice = {
        id: resumeData.id,
        fileName: resumeData.fileName,
        fileUrl: resumeData.fileUrl,
        fileType: resumeData.fileType,
        fileSize: resumeData.fileSize,
        isDefault: resumeData.isDefault,
        createdAt: resumeData.createdAt,
        updatedAt: resumeData.updatedAt,
      };

      setResumeOptions((prev) => {
        const nextResumes = [
          uploadedResume,
          ...prev.filter((resume) => resume.id !== uploadedResume.id),
        ]
          .sort((first, second) => {
            const firstTime = new Date(
              first.updatedAt || first.createdAt || 0
            ).getTime();
            const secondTime = new Date(
              second.updatedAt || second.createdAt || 0
            ).getTime();
            return secondTime - firstTime;
          })
          .slice(0, MAX_RESUMES);

        return nextResumes;
      });

      setSelectedResumeId(uploadedResume.id);
      setUploadedFile(null);
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload resume';
      setApplicationSubmitError(errorMessage);
      onError?.(errorMessage);
    },
  });

  const { deleteResumeRecord, loading: deletingResume } = useDeleteResume({
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete resume';
      setApplicationSubmitError(errorMessage);
      onError?.(errorMessage);
    },
  });

  const { submitApplication, loading: applicationLoading } =
    useCreateApplication({
      onSuccess: (data) => {
        const successMsg = `Application submitted successfully for job ID ${data.jobId}`;
        setApplicationSubmitSuccess(successMsg);
        onSuccess?.(successMsg);
        reset();
        setUploadedFile(null);
        setApplicationSubmitError(null);
        // Close modal after 2 seconds to let user see the success message
        setTimeout(() => {
          onClose();
          // Reset success message when modal closes
          setApplicationSubmitSuccess(null);
        }, 2000);
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to submit application';
        setApplicationSubmitError(errorMessage);
        onError?.(errorMessage);
      },
    });

  const coverLetterValue = watch('coverLetter') || '';
  const charCount = coverLetterValue.length;
  const isUploading = uploading || creatingResume;
  const isSubmitting = applicationLoading;
  const selectedResume =
    resumeOptions.find((resume) => resume.id === selectedResumeId) ??
    (job.currentResume?.id === selectedResumeId && job.currentResume.id
      ? {
        id: job.currentResume.id,
        fileName: job.currentResume.filename,
        fileUrl: job.currentResume.url,
      }
      : null);
  const canUploadNewResume =
    !loadingCandidateProfile && resumeOptions.length < MAX_RESUMES;

  // Reset modal state when opened to prevent stale state from previous session
  useEffect(() => {
    if (isOpen) {
      reset();
      setUploadedFile(null);
      setApplicationSubmitError(null);
      setApplicationSubmitSuccess(null);
      setUploadProgress(0);
      setResumeOptions([]);
      setSelectedResumeId(job.currentResume?.id ?? null);
      setResumeDeleteTarget(null);
      setDeleteResult(null);

      const loadResumes = async () => {
        try {
          const profile = await fetchCandidateProfile();
          const sortedResumes = (profile?.resumes || [])
            .slice()
            .sort((first, second) => {
              const firstTime = new Date(
                first.updatedAt || first.createdAt || 0
              ).getTime();
              const secondTime = new Date(
                second.updatedAt || second.createdAt || 0
              ).getTime();
              return secondTime - firstTime;
            })
            .slice(0, MAX_RESUMES)
            .map((resume) => ({
              id: resume.id,
              fileName: resume.fileName,
              fileUrl: resume.fileUrl,
              fileType: resume.fileType,
              fileSize: resume.fileSize,
              isDefault: resume.isDefault,
              createdAt: resume.createdAt,
              updatedAt: resume.updatedAt,
            }));

          setResumeOptions(sortedResumes);
          setSelectedResumeId((current) => {
            if (current && sortedResumes.some((resume) => resume.id === current)) {
              return current;
            }

            return sortedResumes[0]?.id ?? job.currentResume?.id ?? null;
          });
        } catch (error) {
          console.error('Failed to load candidate resumes', error);
          setResumeOptions([]);
          setSelectedResumeId(job.currentResume?.id ?? null);
        }
      };

      void loadResumes();
    }
  }, [isOpen, reset, job.currentResume, fetchCandidateProfile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canUploadNewResume) {
      const errorMsg = 'You can store up to 5 resumes.';
      setApplicationSubmitError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      setApplicationSubmitError(null);
      setUploadedFile(file);
      setUploadProgress(0);

      // Simulate progress (since S3 upload doesn't provide real progress)
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 30;
        });
      }, 300);

      // ✅ Upload immediately when file is selected
      const uploadResult = await uploadToS3(file, 'resumes');
      setUploadProgress(95);

      // Create resume record in DB
      await createResumeRecord({
        fileKey: uploadResult.fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        isDefault: true,
      });
      setUploadProgress(100);
      // onSuccess callback will update the selected resume
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to upload resume';
      setApplicationSubmitError(errorMsg);
      onError?.(errorMsg);
      setUploadedFile(null);
      setUploadProgress(0);
    } finally {
      // Always clear the progress interval to prevent memory leaks
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    const resumeToDelete = resumeOptions.find((resume) => resume.id === resumeId);
    if (!resumeToDelete) return;

    setResumeDeleteTarget(resumeToDelete);
  };

  const confirmDeleteResume = async () => {
    if (!resumeDeleteTarget) return;

    const resumeName = resumeDeleteTarget.fileName;
    const resumeId = resumeDeleteTarget.id;

    try {
      setApplicationSubmitError(null);
      await deleteResumeRecord(resumeId);

      setResumeOptions((prev) => {
        const remaining = prev.filter((resume) => resume.id !== resumeId);

        if (selectedResumeId === resumeId) {
          setSelectedResumeId(remaining[0]?.id ?? job.currentResume?.id ?? null);
        }

        return remaining;
      });
      setResumeDeleteTarget(null);
      setDeleteResult({
        open: true,
        success: true,
        title: 'Resume deleted',
        description: `"${resumeName}" has been deleted successfully.`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete resume';
      setApplicationSubmitError(errorMessage);
      onError?.(errorMessage);
      setResumeDeleteTarget(null);
      setDeleteResult({
        open: true,
        success: false,
        title: 'Delete failed',
        description: errorMessage,
      });
    }
  };

  const handleFormSubmit = async (data: SubmitApplicationFormData) => {
    if (isSubmitting) return;

    try {
      setApplicationSubmitError(null);

      // Resume must be selected first (defaults to the latest uploaded one)
      if (!selectedResume) {
        onError?.('Please upload a resume first');
        return;
      }

      // Submit application with already-uploaded resume
      const resumeId = selectedResume.id;
      if (!resumeId) {
        throw new Error(
          'Resume ID not found. Please try uploading the resume again.'
        );
      }
      await submitApplication({
        jobId: job.id,
        resumeId,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'An error occurred';
      setApplicationSubmitError(errorMsg);
      onError?.(errorMsg);
      console.error('Error in form submission:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-0.5rem)] max-w-xl max-h-[calc(100vh-0.5rem)] overflow-y-auto p-3 sm:w-full sm:p-6">
        <DialogHeader>
          <DialogTitle className="sr-only">Submit Application</DialogTitle>
          <DialogDescription className="sr-only">
            Submit your application for {job.title} at {job.company}
          </DialogDescription>
        </DialogHeader>

        {/* Job Header */}
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:mb-6 sm:flex-row sm:gap-6 sm:pb-6">
          {job.logoUrl && (
            <div className="flex-shrink-0">
              <Image
                src={job.logoUrl}
                alt={job.company}
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg object-contain sm:h-20 sm:w-20"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-xl font-semibold text-slate-950 sm:text-2xl">
              {job.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="min-w-0 break-words">{job.company}</span>
              {job.location && (
                <>
                  <Dot className="h-1 w-1 text-slate-400" />
                  <span className="min-w-0 break-words">{job.location}</span>
                </>
              )}
              <Dot className="h-1 w-1 text-slate-400" />
              <span className="min-w-0 break-words">{formatJobType(job.jobType)}</span>
            </div>
          </div>
        </div>

        {/* Form Title */}
        <div className="mb-5 sm:mb-6">
          <h3 className="text-lg font-semibold text-slate-950 sm:text-xl">
            Submit your application
          </h3>
          <p className="mt-2 break-words text-xs text-slate-600 sm:text-sm">
            The following is required and will only be shared with {job.company}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Job Title Input */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-950">
              Current of previous job title
            </label>
            <input
              {...register('jobTitle')}
              type="text"
              placeholder="What's your current or previous job title?"
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.jobTitle && (
              <p className="mt-1 text-xs text-red-600">
                {errors.jobTitle.message}
              </p>
            )}
          </div>

          <div className="border-b border-slate-200" />

          {/* Cover Letter Textarea */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-950">
              Additional information/Cover letter
            </label>
            <textarea
              {...register('coverLetter')}
              placeholder="Add a cover letter or anything else you want to share"
              maxLength={1000}
              rows={5}
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span>Maximum 1000 characters</span>
              <span>{charCount} / 1000</span>
            </div>
            {errors.coverLetter && (
              <p className="mt-1 text-xs text-red-600">
                {errors.coverLetter.message}
              </p>
            )}
          </div>

          <div className="border-b border-slate-200" />

          {/* Resume Section */}
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
              {loadingCandidateProfile ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Loading your recent resumes...
                </div>
              ) : resumeOptions.length > 0 ? (
                resumeOptions.map((resume, index) => {
                  const isSelected = resume.id === selectedResumeId;
                  return (
                    <div
                      key={resume.id}
                      className={`flex flex-col gap-3 rounded-lg border px-3 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-4 ${isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedResumeId(resume.id)}
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
                          {resume.isDefault && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 break-words text-[11px] leading-4 text-slate-500 sm:text-xs">
                          {[
                            formatResumeDate(
                              resume.updatedAt || resume.createdAt
                            ),
                            resume.fileType,
                            formatResumeSize(resume.fileSize),
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      </button>

                      <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 sm:justify-start">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleDeleteResume(resume.id)}
                          disabled={deletingResume || isUploading}
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
              ) : job.currentResume ? (
                <a
                  href={job.currentResume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-indigo-600 hover:border-indigo-300 hover:bg-slate-50"
                >
                  {job.currentResume.filename}
                </a>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  No uploaded resumes yet.
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <label className="text-sm font-semibold text-slate-950">
                Attach a new resume
              </label>
              <label
                className={`flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 text-sm transition-colors sm:w-auto sm:px-6 sm:py-4 ${canUploadNewResume
                    ? 'cursor-pointer border-indigo-400 bg-indigo-50 hover:border-indigo-500 hover:bg-indigo-100'
                    : 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400'
                  }`}
              >
                <svg
                  className={`h-5 w-5 shrink-0 sm:h-6 sm:w-6 ${canUploadNewResume ? 'text-indigo-600' : 'text-slate-400'
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
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  disabled={isUploading || !canUploadNewResume}
                  aria-label="Upload resume file"
                />
              </label>
            </div>

            <p className="mt-2 text-[11px] leading-4 text-slate-500 sm:text-xs">
              You can store up to {MAX_RESUMES} resumes.
            </p>

            {/* Upload Progress Bar */}
            {isUploading && (
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
                Could not load your resume history, so the latest uploaded file
                will be used.
              </p>
            )}
          </div>

          <div className="border-b border-slate-200" />

          {/* Backend Pending Fields Note */}
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
            <p className="text-[11px] font-semibold leading-4 text-yellow-800 sm:text-xs">
              ⚠️ Note: 2 additional backend fields pending development
            </p>
            <p className="mt-1 text-[11px] leading-4 text-yellow-700 sm:text-xs">
              These fields will be added to the application once the backend is
              ready.
            </p>
          </div>

          {applicationSubmitSuccess && (
            <div className="rounded-lg border border-green-300 bg-green-50 p-3">
              <p className="text-[11px] font-semibold leading-4 text-green-800 sm:text-xs">✓ Success</p>
              <p className="mt-1 text-[11px] leading-4 text-green-700 sm:text-xs">
                {applicationSubmitSuccess}
              </p>
            </div>
          )}

          {applicationSubmitError && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3">
              <p className="text-[11px] font-semibold leading-4 text-red-800 sm:text-xs">❌ Error</p>
              <p className="mt-1 text-[11px] leading-4 text-red-700 sm:text-xs">
                {applicationSubmitError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !isValid ||
              !selectedResume ||
              isSubmitting ||
              !!applicationSubmitSuccess
            }
            className="w-full rounded-md bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {applicationSubmitSuccess
              ? 'Application Submitted! ✓'
              : isSubmitting
                ? 'Submitting Application...'
                : 'Submit Application'}
          </button>

          {/* Terms and Privacy */}
          <p className="break-words text-xs text-slate-600">
            By sending the request you can confirm that you accept our{' '}
            <Link href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </form>

        <DeleteConfirmDialog
          open={!!resumeDeleteTarget}
          title="Delete resume"
          description={`Delete \"${resumeDeleteTarget?.fileName ?? ''}\"? This action cannot be undone.`}
          loading={deletingResume}
          onOpenChange={(open) => {
            if (!open) {
              setResumeDeleteTarget(null);
            }
          }}
          onCancel={() => setResumeDeleteTarget(null)}
          onConfirm={() => void confirmDeleteResume()}
        />

        <ResultDialog
          open={deleteResult?.open ?? false}
          success={deleteResult?.success ?? false}
          title={deleteResult?.title ?? ''}
          description={deleteResult?.description ?? ''}
          onOpenChange={(open) =>
            setDeleteResult((current) =>
              current ? { ...current, open } : current
            )
          }
          onConfirm={() =>
            setDeleteResult((current) =>
              current ? { ...current, open: false } : current
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
};
