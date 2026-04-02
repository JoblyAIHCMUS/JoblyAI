import React from 'react';

interface ConfirmDeleteProps {
  title?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ConfirmDelete({
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  onCancel,
  onConfirm,
  loading = false,
}: ConfirmDeleteProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[400px] p-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 9v4"
              stroke="#DC2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="16" r="1" fill="#DC2626" />
            <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2" />
          </svg>
        </div>
        <div className="text-lg font-semibold text-gray-900 mb-2 text-center">
          {title}
        </div>
        <div className="text-sm text-gray-500 mb-6 text-center">
          {description}
        </div>
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-[#DC2626] text-white font-semibold hover:bg-[#b91c1c] transition"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
