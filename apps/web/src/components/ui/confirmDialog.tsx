'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = 'confirm-dialog-title';
  const descId = 'confirm-dialog-desc';

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 px-4 py-4">
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg w-full max-w-[500px] p-4 sm:p-6 md:p-8 flex flex-col items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        <div
          id={titleId}
          className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center"
        >
          {title}
        </div>

        <div
          id={descId}
          className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 text-center w-full"
        >
          {description}
        </div>

        <div className="flex gap-2 sm:gap-3 w-full px-2">
          <button
            ref={cancelRef}
            type="button"
            className="flex-1 py-2 sm:py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition font-medium text-xs sm:text-sm"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 sm:py-2.5 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm ${
              destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
