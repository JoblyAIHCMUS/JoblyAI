'use client';

import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface ResultDialogProps {
  open: boolean;
  success: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ResultDialog({
  open,
  success,
  title,
  description,
  confirmLabel = 'OK',
  onOpenChange,
  onConfirm,
}: ResultDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmButtonRef.current?.focus();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-6 text-center outline-none">
        <div className="flex flex-col items-center">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              success ? 'bg-emerald-100' : 'bg-red-100'
            }`}
          >
            {success ? (
              <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 8v4m0 4h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          <DialogTitle className="text-lg font-semibold text-gray-900">
            {title}
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm text-gray-500">
            {description}
          </DialogDescription>

          <button
            ref={confirmButtonRef}
            type="button"
            className={`mt-6 w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
              success
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
                : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}