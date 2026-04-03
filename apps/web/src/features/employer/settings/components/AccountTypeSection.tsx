/* Copied from candidate/settings/components/AccountTypeSection.tsx */
'use client';

import React from 'react';

type AccountType = 'job_seeker' | 'employer';

interface AccountTypeSectionProps {
  selectedType: AccountType;
  onTypeChange: (type: AccountType) => void;
  disabled?: boolean;
}

const accountTypes = [
  {
    id: 'job_seeker',
    title: 'Job Seeker',
    description: 'Looking for a job',
  },
  {
    id: 'employer',
    title: 'Employer',
    description: 'Hiring, sourcing candidates, or posting jobs',
  },
] as const;

export function AccountTypeSection({
  selectedType,
  onTypeChange,
  disabled = false,
}: AccountTypeSectionProps) {
  return (
    <>
      <div className="inline-flex flex-col justify-start items-start gap-1">
        <div className="label-label-1-semi-bold text-primary">Account Type</div>
        <div className="body-body-1-regular text-tertiary">
          You can update your account type
        </div>
      </div>

      <div className="inline-flex flex-col justify-start items-start gap-6">
        {accountTypes.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id as AccountType)}
              disabled={disabled}
              className="inline-flex justify-start items-start gap-4 cursor-pointer p-0 border-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Radio Button */}
              <div className="size-6 relative overflow-hidden flex-shrink-0 mt-0.5">
                {isSelected ? (
                  <>
                    <div className="size-5 left-[2px] top-[2px] absolute rounded-full border border-icon-accent-primary" />
                    <div className="size-3 left-[6px] top-[6px] absolute bg-icon-accent-primary rounded-full" />
                  </>
                ) : (
                  <div className="size-5 left-[2px] top-[2px] absolute rounded-full border-2 border-icon-disabled-alt" />
                )}
              </div>

              {/* Text */}
              <div className="inline-flex flex-col justify-start items-start gap-0">
                <div className="body-body-1-medium text-primary">
                  {type.title}
                </div>
                <div className="body-body-1-regular text-secondary">
                  {type.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
