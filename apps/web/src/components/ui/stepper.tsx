// features/_shared/ui/Stepper.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';

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
}

export function Stepper({ steps, children, onComplete, className }: StepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  // Calculate progress percentage for the fill bar
  const progressPercentage = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 0;

  // Calculate line offset: for N steps with flex-1, each step center is at (50/N)% from edges
  const lineOffset = steps.length > 1 ? 50 / steps.length : 0;

  const goNext = () => {
    if (!isLast) setCurrentIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <div className={cn('flex flex-col min-h-[60vh]', className)}>
      {/* Progress indicator */}
      <ol className="flex justify-between items-center relative mb-10">
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

        {/* Steps */}
        {steps.map((step, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;

          return (
            <li key={step.id} className="flex flex-col items-center relative z-10 flex-1">
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
                onClick={() => setCurrentIndex(idx)}
              >
                {isCompleted ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  step.icon || <span className="text-sm font-medium">{idx + 1}</span>
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

      {/* Content */}
      <div className="flex-1">{React.Children.toArray(children)[currentIndex]}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-10 pt-6 border-t">
        <div>
          {!isFirst && (
            <Button variant="outline" onClick={goPrev} type="button">
              Previous Step
            </Button>
          )}
        </div>

        <div>
          {isLast ? (
            <Button onClick={onComplete} className="bg-indigo-600 hover:bg-indigo-700" type="button">
              Done
            </Button>
          ) : (
            <Button onClick={goNext} className="bg-indigo-600 hover:bg-indigo-700" type="button">
              Next Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}