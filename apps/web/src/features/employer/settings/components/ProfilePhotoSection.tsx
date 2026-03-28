/* Copied from candidate/settings/components/ProfilePhotoSection.tsx */
'use client';

import React, { useRef, ChangeEvent } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProfilePhotoSectionProps {
  photoUrl?: string;
  onPhotoChange: (file: File) => void;
  disabled?: boolean;
}

export function ProfilePhotoSection({
  photoUrl,
  onPhotoChange,
  disabled = false,
}: ProfilePhotoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoChange(file);
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
    if (file && file.type.startsWith('image/')) {
      onPhotoChange(file);
    }
  };

  return (
    <>
      <div className="inline-flex flex-col justify-start items-start gap-1">
        <div className="font-['Lexend_Deca'] text-base font-semibold leading-5 text-primary">
          Profile Photo
        </div>
        <div className="w-64 font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-tertiary">
          This image will be shown publicly as your profile picture, it will
          help recruiters recognize you!
        </div>
      </div>

      <div className="flex justify-start items-start gap-8">
        {/* Avatar Display */}
        <Avatar className="size-32 border-[2.58px] border-primary bg-accent-primary">
          <AvatarImage src={photoUrl} alt="Profile" className="object-cover" />
          <AvatarFallback className="bg-accent-primary text-icon-accent-primary text-lg font-semibold">
            PP
          </AvatarFallback>
        </Avatar>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'cursor-pointer px-10 py-6 rounded-[10px] border-2 border-dashed border-accent-primary bg-accent-primary inline-flex flex-col justify-start items-start gap-2.5 transition-opacity',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />

          {/* Icon */}
          <div className="flex flex-col justify-start items-center gap-2">
            <div className="size-8 relative overflow-hidden">
              <svg
                className="size-8 text-icon-accent-primary"
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
            </div>

            {/* Text */}
            <div className="flex flex-col justify-start items-center gap-1">
              <div className="flex justify-center text-center gap-1">
                <span className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-accent-primary">
                  Click to replace
                </span>
                <span className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-primary">
                  {' '}
                  or drag and drop
                </span>
              </div>
              <div className="font-['Be_Vietnam_Pro'] text-base font-normal leading-6 text-tertiary">
                SVG, PNG, JPG or GIF (max. 400 x 400px)
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
