'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface PreShortlistEligibilityModalProps {
  open: boolean;
  applicationId: number | null;
  questionCount: number;
  onClose: () => void;
  onAnswer: () => void;
}

export function PreShortlistEligibilityModal({
  open,
  applicationId: _applicationId,
  questionCount,
  onClose,
  onAnswer,
}: PreShortlistEligibilityModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      cancelButtonRef.current?.focus();
    }
  }, [open]);

  const questionText =
    questionCount === 1
      ? 'The employer has set 1 pre-shortlist question for this role. Answering it will help them better assess your fit.'
      : `The employer has set ${questionCount} pre-shortlist questions for this role. Answering them will help them better assess your fit.`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm p-6 text-center outline-none">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <Sparkles className="h-7 w-7 text-indigo-600" aria-hidden="true" />
          </div>

          <DialogTitle className="text-lg font-semibold text-gray-900">
            Pre-shortlist questions available
          </DialogTitle>

          <DialogDescription className="mt-2 text-sm text-gray-500">
            {questionText}
          </DialogDescription>

          <div className="mt-6 flex w-full gap-2">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            >
              Maybe later
            </button>

            <button
              type="button"
              onClick={onAnswer}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Answer pre-shortlist questions
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
