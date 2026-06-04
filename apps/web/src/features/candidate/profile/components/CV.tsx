'use client';

import React, {
  useRef,
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Download,
  AlertCircle,
  Trash2,
  Star,
  Wand2,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateDownloadUrl } from '@/api-hook/s3';
import type { CandidateResume } from '@/types/candidate';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CVProps {
  resumes: CandidateResume[];
  selectedResumeId?: number | null;
  onCVChange: (file: File) => Promise<void>;
  onSelectResume?: (resumeId: number) => Promise<void> | void;
  onDeleteResume?: (resumeId: number) => Promise<void>;
  maxResumes?: number;
  disabled?: boolean;
  isUploading?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  processingTasks?: Record<number, { parsing: boolean; scoring: boolean }>;
  deletingResumeId?: number | null;
  uploadError?: string | null;
}

export interface CVRef {
  refreshUrl: (fileKey?: string) => Promise<void>;
}

const CV = forwardRef<CVRef, CVProps>(
  (
    {
      resumes,
      selectedResumeId,
      onCVChange,
      onSelectResume,
      onDeleteResume,
      maxResumes = 5,
      disabled = false,
      isUploading = false,
      isUpdating = false,
      isDeleting = false,
      processingTasks = {},
      deletingResumeId = null,
      uploadError = null,
    }: CVProps,
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
    const [urlLoading, setUrlLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [previewResumeId, setPreviewResumeId] = useState<number | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [confirmDefaultOpen, setConfirmDefaultOpen] = useState(false);
    const [pendingResumeId, setPendingResumeId] = useState<number | null>(null);
    const [uploadOpen, setUploadOpen] = useState(false);

    const { createDownloadUrl } = useCreateDownloadUrl();

    // Structural actions that should block most other things
    const isActionInProgress =
      isUploading || isUpdating || isDeleting || !!deletingResumeId;

    // AI tasks in progress
    const hasActiveTasks = Object.values(processingTasks).some(
      (t) => t.parsing || t.scoring
    );

    // Busy state for global actions (like upload)
    const isBusy = isActionInProgress || hasActiveTasks;

    const resumeCount = resumes?.length || 0;
    const isAtMax = resumeCount >= maxResumes;

    useEffect(() => {
      if (typeof window !== 'undefined') {
        console.log('[CV Component State]', {
          isActionInProgress,
          hasActiveTasks,
          isBusy,
          isAtMax,
          disabled,
          resumeCount,
          processingTasks: JSON.stringify(processingTasks),
        });
      }
    }, [
      isActionInProgress,
      hasActiveTasks,
      isBusy,
      isAtMax,
      disabled,
      resumeCount,
      processingTasks,
    ]);

    const sortedResumes = resumes
      ? [...resumes].sort(
          (a, b) => Number(!!b.isDefault) - Number(!!a.isDefault)
        )
      : [];
    const defaultResume =
      resumes?.find((resume) => resume.id === selectedResumeId) ||
      resumes?.find((resume) => resume.isDefault) ||
      resumes?.[0];
    const previewResume =
      resumes.find((resume) => resume.id === previewResumeId) || defaultResume;

    useEffect(() => {
      if (!resumes.length) {
        setPreviewResumeId(null);
        setIsPreviewOpen(false);
        return;
      }
      if (
        previewResumeId &&
        resumes.some((resume) => resume.id === previewResumeId)
      ) {
        return;
      }
      const nextPreviewId = defaultResume?.id || resumes[0].id;
      setPreviewResumeId(nextPreviewId);
    }, [resumes, defaultResume?.id, previewResumeId]);

    const generateUrl = useCallback(
      async (fileKey?: string) => {
        const keyToUse = fileKey || previewResume?.fileKey;
        if (!keyToUse) {
          setPresignedUrl(null);
          return;
        }

        setUrlLoading(true);
        try {
          const response = await createDownloadUrl({ fileKey: keyToUse });
          setPresignedUrl(response.downloadUrl);
        } catch (error) {
          console.error('Failed to generate presigned URL:', error);
          setPresignedUrl(null);
        } finally {
          setUrlLoading(false);
        }
      },
      [createDownloadUrl, previewResume?.fileKey]
    );

    // Expose refresh function to parent component
    useImperativeHandle(
      ref,
      () => ({
        refreshUrl: generateUrl,
      }),
      [generateUrl]
    );

    useEffect(() => {
      if (!isPreviewOpen) {
        setPresignedUrl(null);
        return;
      }
      generateUrl();
    }, [generateUrl, isPreviewOpen]);

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === 'application/pdf') {
        try {
          setActionError(null);
          await onCVChange(file);
          setUploadOpen(false);
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
          setActionError(null);
          await onCVChange(file);
          setUploadOpen(false);
        } catch (error) {
          console.error('Failed to upload resume:', error);
        }
      }
    };

    const handleDownload = () => {
      if (presignedUrl) {
        const link = document.createElement('a');
        link.href = presignedUrl;
        link.download = previewResume?.fileName || 'Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    const handleOpenPreview = (resumeId: number) => {
      setPreviewResumeId(resumeId);
      setIsPreviewOpen(true);
    };

    const handleOpenDefaultConfirm = (resumeId: number) => {
      if (isBusy) return;
      setPendingResumeId(resumeId);
      setConfirmDefaultOpen(true);
    };

    const handleConfirmDefault = async () => {
      if (pendingResumeId == null) return;
      await handleSetDefault(pendingResumeId);
      setConfirmDefaultOpen(false);
      setPendingResumeId(null);
    };

    const handleSetDefault = async (resumeId: number) => {
      if (isBusy) return;
      try {
        setActionError(null);
        await onSelectResume?.(resumeId);
      } catch (error) {
        console.error('Failed to set default resume:', error);
        setActionError('Failed to set default CV. Please try again.');
      }
    };

    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="text-xl font-semibold text-primary font-['Lexend_Deca']">
              CV/Resume
            </div>
            {isAtMax && (
              <span className="mt-1 text-sm font-medium text-accent-primary font-['Be_Vietnam_Pro']">
                You have reached the maximum of {maxResumes} CVs.
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            disabled={disabled || isBusy || isAtMax}
            className="px-4 py-2 rounded-md bg-[color:var(--bg-accent-solid)] text-white text-sm font-semibold hover:bg-[color:var(--bg-accent-solid-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload CV
          </button>
        </div>

        {resumes.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-secondary font-normal font-['Be_Vietnam_Pro']">
              Stored CVs ({resumeCount}/{maxResumes})
            </div>

            <div className="flex flex-col gap-2">
              {sortedResumes.map((resume) => (
                <div
                  key={resume.id}
                  className={cn(
                    'rounded-lg border bg-[color:var(--bg-primary)] transition-colors',
                    resume.isDefault
                      ? 'border-[color:var(--border-accent-primary)] bg-[color:var(--bg-accent-primary)]'
                      : 'border-[color:var(--border-primary)]'
                  )}
                >
                  <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(resume.id)}
                      className="flex flex-col text-left gap-1"
                      aria-label={`Preview ${resume.fileName}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-primary font-['Be_Vietnam_Pro']">
                          {resume.fileName}
                        </span>
                        {resume.parsedText &&
                          resume.isSyncedToProfile === false && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 text-[10px] py-0 h-5 px-1.5"
                            >
                              ✨ Ready to Sync
                            </Badge>
                          )}
                        {resume.isSyncedToProfile === true && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 text-[10px] py-0 h-5 px-1.5"
                          >
                            ✓ Synced
                          </Badge>
                        )}
                      </div>
                      {resume.isDefault && (
                        <span className="text-xs font-medium text-accent-primary font-['Be_Vietnam_Pro']">
                          Default
                        </span>
                      )}
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Extract Data Button (Parse) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (resume.parsedText) {
                            window.dispatchEvent(
                              new CustomEvent('OPEN_CV_SYNC_MODAL', {
                                detail: { resumeId: resume.id },
                              })
                            );
                          } else {
                            window.dispatchEvent(
                              new CustomEvent('TRIGGER_AI_PARSE', {
                                detail: { resumeId: resume.id },
                              })
                            );
                          }
                        }}
                        disabled={
                          isActionInProgress ||
                          (processingTasks[resume.id]?.parsing &&
                            !resume.parsedText)
                        }
                        className={cn(
                          'h-9 px-3 flex items-center justify-center gap-2 rounded-md border transition-colors text-xs font-semibold',
                          resume.isSyncedToProfile
                            ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : resume.parsedText
                            ? 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm ring-1 ring-amber-100'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        )}
                        aria-label="Extract Data"
                        title={
                          resume.parsedText
                            ? 'Review and Extract Data'
                            : 'Extract Data with AI'
                        }
                      >
                        {processingTasks[resume.id]?.parsing ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                        ) : (
                          <Code2
                            size={14}
                            className={cn(
                              !resume.isSyncedToProfile &&
                                resume.parsedText &&
                                'animate-pulse'
                            )}
                          />
                        )}
                        {processingTasks[resume.id]?.parsing
                          ? 'Extracting...'
                          : resume.isSyncedToProfile
                          ? 'View Sync'
                          : resume.parsedText
                          ? 'Review & Sync'
                          : 'Extract Data'}
                      </button>

                      {/* Score Resume Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            resume.aiScore !== undefined &&
                            resume.aiScore !== null
                          ) {
                            window.dispatchEvent(
                              new CustomEvent('OPEN_AI_FEEDBACK_MODAL', {
                                detail: { resumeId: resume.id },
                              })
                            );
                          } else {
                            window.dispatchEvent(
                              new CustomEvent('TRIGGER_AI_SCORE', {
                                detail: { resumeId: resume.id },
                              })
                            );
                          }
                        }}
                        disabled={
                          isActionInProgress ||
                          (processingTasks[resume.id]?.scoring &&
                            !(
                              resume.aiScore !== undefined &&
                              resume.aiScore !== null
                            ))
                        }
                        className={cn(
                          'h-9 px-3 flex items-center justify-center gap-2 rounded-md border transition-colors text-xs font-semibold',
                          resume.aiScore !== undefined &&
                            resume.aiScore !== null
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-blue-100' // Consistent hover
                            : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        )}
                        aria-label="Score Resume"
                        title={
                          resume.aiScore !== undefined &&
                          resume.aiScore !== null
                            ? 'View AI Score'
                            : 'Score with AI'
                        }
                      >
                        {processingTasks[resume.id]?.scoring ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                        ) : (
                          <Wand2 size={14} />
                        )}
                        {processingTasks[resume.id]?.scoring
                          ? 'Scoring...'
                          : resume.aiScore !== undefined &&
                            resume.aiScore !== null
                          ? `Score: ${Math.round((resume.aiScore || 0) * 100)}%`
                          : 'Score Resume'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDefaultConfirm(resume.id)}
                        disabled={
                          resume.isDefault ||
                          isBusy ||
                          processingTasks[resume.id]?.parsing ||
                          processingTasks[resume.id]?.scoring
                        }
                        className={cn(
                          'h-9 w-9 flex items-center justify-center rounded-md border transition-colors',
                          resume.isDefault
                            ? 'border-[color:var(--border-primary)] text-[color:var(--text-disabled)] cursor-not-allowed'
                            : 'border-[color:var(--border-primary)] text-accent-primary hover:bg-[color:var(--bg-tertiary)]'
                        )}
                        aria-label="Set as default CV"
                        title="Set as default"
                      >
                        <Star size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteResume?.(resume.id)}
                        disabled={
                          deletingResumeId === resume.id ||
                          processingTasks[resume.id]?.parsing ||
                          processingTasks[resume.id]?.scoring ||
                          isUpdating ||
                          isDeleting
                        }
                        className="h-9 w-9 flex items-center justify-center rounded-md border border-[color:var(--border-primary)] text-red-600 hover:bg-[color:var(--bg-tertiary)] transition-colors"
                        aria-label="Delete CV"
                        title="Delete"
                      >
                        {deletingResumeId === resume.id ||
                        processingTasks[resume.id]?.parsing ||
                        processingTasks[resume.id]?.scoring ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                        ) : (
                          <Trash2 size={16} className="text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={confirmDefaultOpen} onOpenChange={setConfirmDefaultOpen}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col gap-3">
              <DialogTitle className="text-lg font-semibold text-primary font-['Lexend_Deca']">
                Set Default CV
              </DialogTitle>
              <DialogDescription className="text-sm text-secondary">
                This CV will be used as your default resume for applications.
              </DialogDescription>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-[color:var(--border-primary)] text-primary hover:bg-[color:var(--bg-tertiary)]"
                  onClick={() => setConfirmDefaultOpen(false)}
                  disabled={isBusy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-[color:var(--bg-accent-solid)] text-white hover:bg-[color:var(--bg-accent-solid-hover)]"
                  onClick={handleConfirmDefault}
                  disabled={isBusy}
                >
                  Set default
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="w-[95vw] max-w-6xl h-[90vh] p-0 overflow-hidden bg-[color:var(--bg-primary)] border border-[color:var(--border-primary)]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border-primary)] px-6 py-4 pr-12">
                <DialogTitle className="text-lg font-semibold text-primary font-['Lexend_Deca']">
                  {previewResume?.fileName || 'CV Preview'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Preview the selected CV document.
                </DialogDescription>
                <button
                  onClick={handleDownload}
                  disabled={!presignedUrl || isBusy}
                  className="flex items-center justify-center h-10 w-10 rounded-lg border border-[color:var(--border-primary)] bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--bg-secondary)] transition-colors"
                  aria-label="Download CV"
                  title="Download"
                >
                  <Download size={18} className="text-primary" />
                </button>
              </div>
              <div className="flex-1 bg-[color:var(--bg-secondary)]">
                {urlLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--text-accent-primary)]"></div>
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
                    <p className="text-secondary">Failed to load PDF</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-xl">
            <div className="flex flex-col gap-3">
              <DialogTitle className="text-lg font-semibold text-primary font-['Lexend_Deca']">
                Upload CV
              </DialogTitle>
              <DialogDescription className="text-sm text-secondary">
                Drag and drop your PDF file or click to select one.
              </DialogDescription>
              {isAtMax && (
                <div className="text-sm font-medium text-accent-primary font-['Be_Vietnam_Pro']">
                  You already have {maxResumes} CVs. Delete one to upload a new
                  CV.
                </div>
              )}
              <div
                onClick={() =>
                  !isBusy && !isAtMax && fileInputRef.current?.click()
                }
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'cursor-pointer px-10 py-6 rounded-[10px] border-2 border-dashed transition-all',
                  dragActive
                    ? 'border-[color:var(--border-accent-primary)] bg-[color:var(--bg-accent-primary)] opacity-100'
                    : 'border-[color:var(--border-primary)] bg-[color:var(--bg-secondary)]',
                  (disabled || isBusy || isAtMax) &&
                    'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  disabled={disabled || isBusy || isAtMax}
                  className="hidden"
                />
                <div className="flex flex-col justify-start items-center gap-2.5">
                  {isBusy ? (
                    <div className="size-8 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--text-accent-primary)]"></div>
                    </div>
                  ) : (
                    <div className="size-8 relative overflow-hidden">
                      <svg
                        className="size-8 text-[color:var(--text-secondary)]"
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

                  <div className="flex flex-col justify-start items-center gap-1">
                    {isBusy ? (
                      <div className="text-base font-normal text-accent-primary font-['Be_Vietnam_Pro']">
                        Processing...
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center text-center gap-1">
                          <span className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-secondary">
                            Click to upload
                          </span>
                          <span className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-primary">
                            {' '}
                            or drag and drop
                          </span>
                        </div>
                        <div className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-tertiary">
                          PDF only (max. 5 MB)
                        </div>
                        {isAtMax && (
                          <div className="font-['Be_Vietnam_Pro'] text-sm font-medium text-danger">
                            You have reached the maximum of {maxResumes} CVs.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error Message */}
        {(uploadError || actionError) && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <span className="text-sm font-medium text-red-700">
              {uploadError || actionError}
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
);

CV.displayName = 'CV';

export default CV;
