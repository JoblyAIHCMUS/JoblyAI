// features/_shared/ui/Stepper.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type StepperSteps = readonly {
  id: string;
  label: string;
  icon?: React.ReactNode;
}[];

interface StepperProps {
  steps: StepperSteps;
  children: React.ReactNode;
  onComplete?: () => void;
  className?: string;
  /** Controls whether the Next/Done button is enabled. Can be a boolean or a function receiving the current step index. */
  canProceed?: boolean | ((stepIndex: number) => boolean);
  /** Optional loading state. Disables navigation and shows loading indicator on Next/Done button. */
  loading?: boolean;
}

export function Stepper({
  steps,
  children,
  onComplete,
  className,
  canProceed = true,
  loading = false,
}: StepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;
  const canProceedNow =
    typeof canProceed === 'function' ? canProceed(currentIndex) : canProceed;

  // Calculate progress percentage for the fill bar
  const progressPercentage =
    steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;

  // Calculate line offset: for N steps with flex-1, each step center is at (50/N)% from edges
  const lineOffset = steps.length > 1 ? 50 / steps.length : 0;

  const goNext = () => {
    if (!isLast && !loading) setCurrentIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (!isFirst && !loading) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div className={cn('flex flex-col min-h-[60vh]', className)}>
      {/* Progress indicator */}
      <div className="relative mb-10">
        {/* Progress line container - positioned between first and last step centers */}
        <div
          className="absolute top-[18px] h-0.5 bg-gray-200 dark:bg-gray-700 z-0 rounded-full"
          style={{ left: `${lineOffset}%`, right: `${lineOffset}%` }}
        >
          {/* Progress fill */}
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <ol className="flex justify-between items-center">
          {/* Steps */}
          {steps.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex;

            return (
              <li
                key={step.id}
                className="flex flex-col items-center relative z-10 flex-1"
              >
                <button
                  type="button"
                  className={cn(
                    'size-9 rounded-full flex items-center justify-center transition-colors shrink-0',
                    isCompleted
                      ? 'bg-indigo-600 text-white'
                      : isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  )}
                  onClick={() => {
                    if (loading) return;
                    // Allow going back to completed steps or staying on current
                    if (idx <= currentIndex) {
                      setCurrentIndex(idx);
                      return;
                    }

                    // For future steps, require current step to be allowed to proceed
                    if (!canProceedNow) {
                      return;
                    }

                    // Prevent skipping multiple steps ahead in a single click
                    if (idx > currentIndex + 1) {
                      return;
                    }

                    setCurrentIndex(idx);
                  }}
                  disabled={loading}
                >
                  {isCompleted ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    step.icon || (
                      <span className="text-sm font-medium">{idx + 1}</span>
                    )
                  )}
                </button>
                <span
                  className={cn(
                    'text-xs mt-1.5 hidden sm:block',
                    isActive || isCompleted
                      ? 'text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Content */}
      <div className="flex-1">
        {React.Children.toArray(children)[currentIndex]}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-10 pt-6 border-t">
        <div>
          {!isFirst && (
            <Button
              variant="outline"
              onClick={goPrev}
              type="button"
              disabled={loading}
            >
              Previous Step
            </Button>
          )}
        </div>

        <div>
          {isLast ? (
            <Button
              onClick={onComplete}
              className="bg-indigo-600 hover:bg-indigo-700"
              type="button"
              disabled={!canProceedNow || loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Done'
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="bg-indigo-600 hover:bg-indigo-700"
              type="button"
              disabled={!canProceedNow || loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Next Step'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
