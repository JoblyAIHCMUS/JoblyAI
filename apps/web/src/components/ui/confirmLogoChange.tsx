'use client';

import React, { useRef, useEffect } from 'react';

interface ConfirmLogoChangeProps {
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  currentLogoUrl?: string;
  newLogoPreviewUrl?: string;
}

/**
 * Confirmation dialog for company logo changes
 *
 * Shows the current logo and the new logo being uploaded,
 * allowing the user to confirm or cancel the change.
 */
export default function ConfirmLogoChange({
  onCancel,
  onConfirm,
  loading = false,
  currentLogoUrl,
  newLogoPreviewUrl,
}: ConfirmLogoChangeProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = 'confirm-logo-title';
  const descId = 'confirm-logo-desc';

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
          Change Company Logo
        </div>

        <div
          id={descId}
          className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 text-center w-full"
        >
          Confirm to change your company logo. Your old logo will be removed
          from the system.
        </div>

        {/* Logo Preview Section */}
        <div className="flex gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 justify-center items-center w-full px-2">
          {/* Current Logo */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="text-xs font-medium text-gray-600">Current</div>
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--indigo-50)',
              }}
            >
              {currentLogoUrl ? (
                <img
                  src={currentLogoUrl}
                  alt="Current logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Arrow */}
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>

          {/* New Logo */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="text-xs font-medium text-gray-600">New</div>
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg border-2 border-blue-400 overflow-hidden flex items-center justify-center ring-1 ring-blue-200"
              style={{
                backgroundColor: 'var(--indigo-50)',
              }}
            >
              {newLogoPreviewUrl && (
                <img
                  src={newLogoPreviewUrl}
                  alt="New logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 w-full px-2">
          <button
            ref={cancelRef}
            className="flex-1 py-2 sm:py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition font-medium text-xs sm:text-sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 sm:py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
