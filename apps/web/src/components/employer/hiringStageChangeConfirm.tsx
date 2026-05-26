import React, { useRef, useEffect } from 'react';

type ActionType = 'advance' | 'reject';

interface HiringStageChangeConfirmProps {
  actionType: ActionType;
  currentStage?: string;
  nextStage?: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function HiringStageChangeConfirm({
  actionType,
  currentStage,
  nextStage,
  onCancel,
  onConfirm,
  loading = false,
}: HiringStageChangeConfirmProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = 'hiring-stage-confirm-title';
  const descId = 'hiring-stage-confirm-desc';

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  const getContent = () => {
    if (actionType === 'advance') {
      return {
        title: `Advance to ${nextStage}?`,
        description:
          'This action will move the applicant to the next hiring stage. You will not be able to move them back.',
        icon: (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M9 12L11.5 14.5L15 11"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="2" />
          </svg>
        ),
        bgColor: 'bg-[#DCFCE7]',
      };
    }

    return {
      title: 'Reject Applicant?',
      description:
        'This action will reject the applicant. This decision is final and cannot be undone.',
      icon: (
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
      ),
      bgColor: 'bg-[#FEE2E2]',
    };
  };

  const content = getContent();
  const confirmButtonColor =
    actionType === 'advance'
      ? 'bg-[#22c55e] hover:bg-[#16a34a]'
      : 'bg-[#DC2626] hover:bg-[#b91c1c]';
  const confirmButtonLabel = actionType === 'advance' ? 'Advance' : 'Reject';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 !m-0">
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-[400px] p-8 flex flex-col items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        <div
          className={`w-12 h-12 rounded-full ${content.bgColor} flex items-center justify-center mb-4`}
        >
          {content.icon}
        </div>
        <div
          id={titleId}
          className="text-lg font-semibold text-gray-900 mb-2 text-center"
        >
          {content.title}
        </div>
        <div id={descId} className="text-sm text-gray-500 mb-6 text-center">
          {content.description}
        </div>
        <div className="flex gap-2 w-full">
          <button
            ref={cancelRef}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`flex-1 py-2 rounded-lg ${confirmButtonColor} text-white font-semibold transition`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
