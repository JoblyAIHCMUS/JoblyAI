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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-[500px] p-8 flex flex-col items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        <div
          id={titleId}
          className="text-lg font-semibold text-gray-900 mb-4 text-center"
        >
          Change Company Logo
        </div>

        <div
          id={descId}
          className="text-sm text-gray-500 mb-6 text-center w-full"
        >
          Confirm to change your company logo. Your old logo will be removed
          from the system.
        </div>

        {/* Logo Preview Section */}
        <div className="flex gap-6 mb-8 justify-center items-center w-full px-4">
          {/* Current Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-medium text-gray-600">Current</div>
            <div
              className="w-24 h-24 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center"
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
                  className="w-10 h-10 text-gray-400"
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
            className="w-6 h-6 text-gray-400"
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
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-medium text-gray-600">New</div>
            <div
              className="w-24 h-24 rounded-lg border-2 border-blue-400 overflow-hidden flex items-center justify-center ring-1 ring-blue-200"
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
        <div className="flex gap-3 w-full px-4">
          <button
            ref={cancelRef}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition font-medium"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
