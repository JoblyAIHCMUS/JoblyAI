'use client';

import React, { useRef, ChangeEvent, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ConfirmAvatarChange from '@/components/ui/confirmAvatarChange';
import { cn } from '@/lib/utils';
import { useCreateUploadUrl } from '@/api-hook/gcs';
import { useUploadToPresignedUrl } from '@/api-hook/gcs';
import { useUpdateEmployerAvatar, useDeleteEmployerAvatar } from '@/api-hook/employer';
import { useToast } from '@/hooks/useToast';
import { formatErrorForDisplay } from '@/lib/errors';
import {
  UploadFolder,
  isFileTypeAllowed,
  getFileTypeErrorMessage,
} from '@/lib/file-type-constants';

interface ProfilePhotoSectionProps {
  photoUrl?: string;
  onAvatarUpdated?: (newUrl: string) => void;
  onAvatarRemoved?: () => void;
  disabled?: boolean;
}

/**
 * Profile Photo Section with avatar upload capability
 *
 * Features:
 * - Upload avatar directly to S3 (public access)
 * - Show preview before confirmation
 * - Delete old avatar on change
 * - Confirmation dialog before replacing
 */
export function ProfilePhotoSection({
  photoUrl,
  onAvatarUpdated,
  onAvatarRemoved,
  disabled = false,
}: ProfilePhotoSectionProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { createUploadUrl, loading: loadingUploadUrl } = useCreateUploadUrl();
  const { uploadToPresignedUrl, loading: loadingUpload } =
    useUploadToPresignedUrl();
  const { updateAvatarRecord, loading: loadingUpdate } =
    useUpdateEmployerAvatar();
  const {
    deleteAvatarRecord,
    loading: loadingDelete,
  } = useDeleteEmployerAvatar();

  const handleFileSelect = (file: File) => {
    // Validate file type against backend ALLOWED_FILE_TYPES for avatars
    if (!isFileTypeAllowed(file.type, UploadFolder.AVATARS)) {
      toast.error(getFileTypeErrorMessage(UploadFolder.AVATARS));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setPreviewUrl(preview);
      setSelectedFile(file);
      setShowConfirmation(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('opacity-50');
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Step 1: Get presigned upload URL from S3
      const uploadUrlResponse = await createUploadUrl({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        folder: 'avatars',
      });

      // Step 2: Upload file directly to S3
      await uploadToPresignedUrl(uploadUrlResponse.uploadUrl, selectedFile, {
        contentType: selectedFile.type,
        folder: 'avatars',
      });

      // Step 3: Update user avatar in database
      await updateAvatarRecord({
        fileKey: uploadUrlResponse.fileKey,
        fileUrl: uploadUrlResponse.fileUrl,
      });

      // Step 4: Success - update UI and notify parent
      onAvatarUpdated?.(uploadUrlResponse.fileUrl);
      toast.success('Profile picture updated successfully');

      // Reset state
      setShowConfirmation(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(
        formatErrorForDisplay(error, 'Failed to update profile picture')
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowConfirmation(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatarRecord();
      onAvatarRemoved?.();
      toast.success('Profile picture removed successfully');
    } catch (error) {
      toast.error(
        formatErrorForDisplay(error, 'Failed to remove profile picture')
      );
    }
  };

  const isLoading =
    isUploading || loadingUploadUrl || loadingUpload || loadingUpdate || loadingDelete;

  const showRemove = !!photoUrl && photoUrl !== 'https://placehold.co/124x124';

  return (
    <>
      <div className="inline-flex flex-col justify-start items-start gap-1 w-full">
        <div className="font-['Lexend_Deca'] text-sm sm:text-base font-semibold leading-5 text-primary">
          Profile Photo
        </div>
        <div className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm font-normal leading-5 sm:leading-6 text-tertiary w-full">
          This image will be shown publicly as your profile picture, it will
          help recruiters recognize you!
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-start items-start gap-4 sm:gap-6 md:gap-8 w-full">
        {/* Avatar Display */}
        <div className="flex flex-col items-center gap-2">
          <Avatar className="size-24 sm:size-28 md:size-32 border-2 sm:border-[2.58px] border-primary bg-accent-primary flex-shrink-0">
            <AvatarImage src={photoUrl} alt="Profile" className="object-cover" />
            <AvatarFallback className="bg-accent-primary text-icon-accent-primary text-base sm:text-lg font-semibold">
              PP
            </AvatarFallback>
          </Avatar>
          {showRemove && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isLoading}
              className="text-xs font-medium text-red-500 hover:text-red-700 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'cursor-pointer px-4 sm:px-6 md:px-10 py-4 sm:py-5 md:py-6 rounded-[10px] border-2 border-dashed border-accent-primary bg-accent-primary inline-flex flex-col justify-start items-start gap-2.5 transition-opacity w-full sm:flex-1',
            (disabled || isLoading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileInputChange}
            disabled={disabled || isLoading}
            className="hidden"
          />

          {/* Icon */}
          <div className="flex flex-col justify-start items-center gap-2 w-full">
            <div className="size-6 sm:size-7 md:size-8 relative overflow-hidden">
              {isLoading ? (
                <svg
                  className="animate-spin size-full text-icon-accent-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="size-full text-icon-accent-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>

            {/* Text */}
            <div className="flex flex-col justify-start items-center gap-1 w-full">
              <div className="flex justify-center text-center gap-1 flex-wrap">
                <span className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm font-normal leading-5 sm:leading-6 text-accent-primary">
                  Click to replace
                </span>
                <span className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm font-normal leading-5 sm:leading-6 text-primary">
                  or drag and drop
                </span>
              </div>
              <div className="font-['Be_Vietnam_Pro'] text-xs sm:text-sm font-normal leading-5 sm:leading-6 text-tertiary text-center">
                {isLoading
                  ? 'Uploading...'
                  : 'JPEG, PNG or WebP (max. 400 x 400px)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <ConfirmAvatarChange
          currentAvatarUrl={photoUrl}
          newAvatarPreviewUrl={previewUrl || undefined}
          onCancel={handleCancelUpload}
          onConfirm={handleConfirmUpload}
          loading={isLoading}
        />
      )}
    </>
  );
}
