'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';
import {
  SubmitApplicationSchema,
  SubmitApplicationFormData,
} from '@/lib/validation';
import Link from 'next/link';
import Image from 'next/image';
import { useCreateApplication } from '@/api-hook/application/useCreateApplication';
import { useUploadFile } from '@/api-hook/s3';
import { useCreateResume } from '@/api-hook/candidate';
import type { CandidateResume } from '@/types/candidate';

export interface JobApplication {
  id: number;
  title: string;
  company: string;
  location: string;
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

const formatJobType = (type: string): string => {
  return type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
};

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localResume, setLocalResume] = useState<
    { id?: number; filename: string; url: string } | ''
  >(job.currentResume || '');

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

  const { createResumeRecord, loading: creatingResume } = useCreateResume({
    onSuccess: (resumeData: CandidateResume) => {
      setLocalResume({
        id: resumeData.id,
        filename: resumeData.fileName,
        url: resumeData.fileUrl,
      });
      setUploadedFile(null);
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload resume';
      setApplicationSubmitError(errorMessage);
      onError?.(errorMessage);
    },
  });

  const { submitApplication, loading: applicationLoading } =
    useCreateApplication({
      onSuccess: (data) => {
        onSuccess?.(
          `Application submitted successfully for job ID ${data.jobId}`
        );
        reset();
        setUploadedFile(null);
        setApplicationSubmitError(null);
        setLocalResume('');
        onClose();
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setApplicationSubmitError(null);
      setUploadedFile(file);
      setUploadProgress(0);

      // Simulate progress (since S3 upload doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 30;
        });
      }, 300);

      // ✅ Upload immediately when file is selected
      const uploadResult = await uploadToS3(file, 'resumes');
      clearInterval(progressInterval);
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
      // onSuccess callback will update localResume
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to upload resume';
      setApplicationSubmitError(errorMsg);
      onError?.(errorMsg);
      setUploadedFile(null);
      setUploadProgress(0);
    }
  };

  const handleFormSubmit = async (data: SubmitApplicationFormData) => {
    if (isSubmitting) return;

    try {
      setApplicationSubmitError(null);

      // Resume must be uploaded first (happens in handleFileChange)
      if (!localResume) {
        onError?.('Please upload a resume first');
        return;
      }

      // Submit application with already-uploaded resume
      const resumeId =
        typeof localResume === 'string' ? undefined : localResume?.id;
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

  const handleClose = () => {
    reset();
    setUploadedFile(null);
    setApplicationSubmitError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalHeader onClose={handleClose} />

      <ModalBody>
        {/* Job Header */}
        <div className="mb-6 flex gap-6 border-b border-slate-200 pb-6">
          {job.logoUrl && (
            <div className="flex-shrink-0">
              <Image
                src={job.logoUrl}
                alt={job.company}
                width={80}
                height={80}
                className="rounded-lg object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-950">
              {job.title}
            </h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
              <span>{job.company}</span>
              <span className="h-1 w-1 rounded-full bg-slate-400" />
              <span>{job.location}</span>
              <span className="h-1 w-1 rounded-full bg-slate-400" />
              <span>{formatJobType(job.jobType)}</span>
            </div>
          </div>
        </div>

        {/* Form Title */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-950">
            Submit your application
          </h3>
          <p className="mt-2 text-sm text-slate-600">
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
            <div className="mb-6 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-950">
                Use your latest resume
              </label>
              {localResume ? (
                <a
                  href={localResume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {localResume.filename}
                </a>
              ) : job.currentResume ? (
                <a
                  href={job.currentResume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {job.currentResume.filename}
                </a>
              ) : null}
            </div>

            {/* File Upload */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-950">
                Attach a new resume
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50 px-6 py-4 text-sm transition-colors hover:border-indigo-500 hover:bg-indigo-100">
                <svg
                  className="h-6 w-6 text-indigo-600"
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
                <span className="font-medium text-slate-950">
                  {localResume
                    ? `✓ ${localResume.filename}`
                    : uploadedFile
                    ? uploadedFile.name
                    : 'Attach Resume/CV'}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {localResume && (
              <p className="mt-3 text-xs text-green-600">
                ✓ Resume ready: {localResume.filename}
              </p>
            )}
          </div>

          <div className="border-b border-slate-200" />

          {/* Backend Pending Fields Note */}
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
            <p className="text-xs font-semibold text-yellow-800">
              ⚠️ Note: 2 additional backend fields pending development
            </p>
            <p className="mt-1 text-xs text-yellow-700">
              These fields will be added to the application once the backend is
              ready.
            </p>
          </div>

          {applicationSubmitError && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-800">❌ Error</p>
              <p className="mt-1 text-xs text-red-700">
                {applicationSubmitError}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || !localResume || isSubmitting}
            className="w-full rounded-md bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </button>

          {/* Terms and Privacy */}
          <p className="text-xs text-slate-600">
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
      </ModalBody>
    </Modal>
  );
};
