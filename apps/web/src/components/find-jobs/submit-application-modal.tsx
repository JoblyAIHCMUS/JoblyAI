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
import { ApplicationForm } from '@/components/find-jobs/ApplicationForm';
import {
  ResumeSection,
  type ResumeChoice,
} from '@/components/find-jobs/ResumeSection';
import { SubmitApplicationSchema } from '@/lib/validation';
import type { SubmitApplicationFormData } from '@/lib/validation';
import { z } from 'zod';
import Link from 'next/link';
import { useCreateApplication } from '@/api-hook/application/useCreateApplication';
import { useUploadFile } from '@/api-hook/s3';
import {
  useCreateResume,
  useDeleteResume,
  useGetCandidateProfile,
} from '@/api-hook/candidate';
import type { CandidateResume } from '@/types/candidate';
import { formatJobType } from '@/features/find-jobs/job-detail/job.utils';
import { Dot } from 'lucide-react';
import { type EmploymentType } from '@/types/job';

const MAX_RESUMES = 5;

interface DeleteResultState {
  open: boolean;
  success: boolean;
  title: string;
  description: string;
}

export interface JobApplication {
  id: number;
  title: string;
  company: string;
  location: string | null;
  jobType: EmploymentType;
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
  const [resumeDeleteTarget, setResumeDeleteTarget] =
    useState<ResumeChoice | null>(null);
  const [deleteResult, setDeleteResult] = useState<DeleteResultState | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<
    z.input<typeof SubmitApplicationSchema>,
    unknown,
    SubmitApplicationFormData
  >({
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
        ].sort((first, second) => {
          const firstTime = new Date(
            first.updatedAt || first.createdAt || 0
          ).getTime();
          const secondTime = new Date(
            second.updatedAt || second.createdAt || 0
          ).getTime();
          return secondTime - firstTime;
        });

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
  const candidateProfileErrorMessage =
    candidateProfileError instanceof Error
      ? candidateProfileError.message
      : candidateProfileError
      ? String(candidateProfileError)
      : null;

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
            if (
              current &&
              sortedResumes.some((resume) => resume.id === current)
            ) {
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
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!canUploadNewResume) {
      const errorMsg = 'You can store up to 5 resumes.';
      setApplicationSubmitError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    let progressInterval: ReturnType<typeof setInterval> | null = null;

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
    const resumeToDelete = resumeOptions.find(
      (resume) => resume.id === resumeId
    );
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
          setSelectedResumeId(
            remaining[0]?.id ?? job.currentResume?.id ?? null
          );
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
          {job.logoUrl ? (
            <div className="flex-shrink-0">
              <img
                src={job.logoUrl}
                alt={job.company}
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg object-contain sm:h-20 sm:w-20"
              />
            </div>
          ) : null}
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
              <span className="min-w-0 break-words">
                {formatJobType(job.jobType)}
              </span>
            </div>
          </div>
        </div>

        {/* Form Title */}
        <div className="mb-5 sm:mb-6">
          <h3 className="text-lg font-semibold text-slate-950 sm:text-xl">
            Submit your application
          </h3>
          <p className="mt-2 break-words text-xs text-slate-600 sm:text-sm">
            The following information will only be shared with {job.company}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <ApplicationForm
            register={register}
            errors={errors}
            charCount={charCount}
          />

          <ResumeSection
            resumes={resumeOptions}
            selectedResumeId={selectedResumeId}
            selectedResume={selectedResume}
            uploadedFile={uploadedFile}
            onSelect={setSelectedResumeId}
            onDelete={handleDeleteResume}
            onUpload={handleFileChange}
            loading={loadingCandidateProfile}
            uploading={isUploading}
            uploadProgress={uploadProgress}
            deletingResume={deletingResume}
            candidateProfileError={candidateProfileErrorMessage}
            canUploadNewResume={canUploadNewResume}
            maxResumes={MAX_RESUMES}
          />

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
              <p className="text-[11px] font-semibold leading-4 text-green-800 sm:text-xs">
                ✓ Success
              </p>
              <p className="mt-1 text-[11px] leading-4 text-green-700 sm:text-xs">
                {applicationSubmitSuccess}
              </p>
            </div>
          )}

          {applicationSubmitError && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3">
              <p className="text-[11px] font-semibold leading-4 text-red-800 sm:text-xs">
                ❌ Error
              </p>
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
          description={`Delete "${
            resumeDeleteTarget?.fileName ?? ''
          }"? This action cannot be undone.`}
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
