/* Copied from candidate/settings/components/NotificationOptions.tsx */
import { Checkbox } from '@/components/ui/checkbox';
import React from 'react';

interface NotificationOptionsProps {
  notifications: {
    applications: boolean;
    jobs: boolean;
    recommendations: boolean;
    messages: boolean;
  };
  onChange: (key: keyof NotificationOptionsProps['notifications']) => void;
  disabled?: boolean;
}

export const NotificationOptions: React.FC<NotificationOptionsProps> = ({
  notifications,
  onChange,
  disabled = false,
}) => (
  <div className="flex flex-col md:flex-row pt-4 sm:pt-5 md:pt-6 md:items-start gap-4 sm:gap-6 md:gap-[117px] w-full">
    {/* Left: Title & Desc */}
    <div className="flex flex-col gap-1 min-w-0 md:min-w-[220px]">
      <div
        className="text-sm sm:text-base md:text-[16px] font-semibold font-['Lexend_Deca']"
        style={{ color: 'var(--text-primary, #0F172A)' }}
      >
        Notifications
      </div>
      <div
        className="text-xs sm:text-sm md:text-base font-normal font-['Be_Vietnam_Pro']"
        style={{ color: 'var(--text-tertiary, #64748B)' }}
      >
        Customize your preferred notification settings
      </div>
    </div>
    {/* Right: Notification Options */}
    <div className="flex flex-col gap-3 sm:gap-4 w-full md:w-auto">
      {/* Applications Checkbox */}
      <div className="flex flex-row items-start gap-2 sm:gap-3 md:gap-4">
        <Checkbox
          checked={notifications.applications}
          onCheckedChange={() => onChange('applications')}
          disabled={disabled}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-[5px] border-2 border-primary data-[state=checked]:bg-[var(--icon-accent-primary,#4338CA)] data-[state=checked]:text-white data-[state=unchecked]:bg-white flex-shrink-0 mt-0.5"
        />
        <div className="flex flex-col gap-1 min-w-0">
          <div
            className="text-sm sm:text-base md:text-[16px] font-medium font-['Lexend_Deca']"
            style={{ color: 'var(--text-primary, #0F172A)' }}
          >
            Applications
          </div>
          <div
            className="text-xs sm:text-sm md:text-base font-normal font-['Be_Vietnam_Pro'] max-w-[336px]"
            style={{ color: 'var(--text-secondary, #475569)' }}
          >
            These are notifications for candidates who have applied to your job
            postings.
          </div>
        </div>
      </div>

      {/* Messages Checkbox */}
      <div className="flex flex-row items-start gap-2 sm:gap-3 md:gap-4">
        <Checkbox
          checked={notifications.messages}
          onCheckedChange={() => onChange('messages')}
          disabled={disabled}
          aria-label="Toggle message notifications"
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-[5px] border-2 border-primary data-[state=checked]:bg-[var(--icon-accent-primary,#4338CA)] data-[state=checked]:text-white data-[state=unchecked]:bg-white flex-shrink-0 mt-0.5"
        />
        <div className="flex flex-col gap-1 min-w-0">
          <div
            className="text-sm sm:text-base md:text-[16px] font-medium font-['Lexend_Deca']"
            style={{ color: 'var(--text-primary, #0F172A)' }}
          >
            Messages
          </div>
          <div
            className="text-xs sm:text-sm md:text-base font-normal font-['Be_Vietnam_Pro'] max-w-[336px]"
            style={{ color: 'var(--text-secondary, #475569)' }}
          >
            These are notifications when candidates or applicants send you a
            message.
          </div>
        </div>
      </div>
    </div>
  </div>
);
