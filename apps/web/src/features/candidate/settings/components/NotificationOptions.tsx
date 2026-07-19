import { Checkbox } from '@/components/ui/checkbox';
import { NotificationSettings } from '@/types/notification';
import React from 'react';

interface NotificationOptionsProps {
  notifications: NotificationSettings;
  onChange: (key: keyof NotificationOptionsProps['notifications']) => void;
  disabled?: boolean;
}

export const NotificationOptions: React.FC<NotificationOptionsProps> = ({
  notifications,
  onChange,
  disabled = false,
}) => (
  <div className="flex flex-col md:flex-row pt-6 md:items-start gap-4 md:gap-[117px] w-full">
    {/* Left: Title & Desc */}
    <div className="flex flex-col gap-1 min-w-[220px]">
      <div
        className="text-[16px] font-semibold font-['Lexend_Deca']"
        style={{ color: 'var(--text-primary, #0F172A)' }}
      >
        Notifications
      </div>
      <div
        className="text-base font-normal font-['Be_Vietnam_Pro']"
        style={{ color: 'var(--text-tertiary, #64748B)' }}
      >
        Choose which real-time notifications you want to receive
      </div>
    </div>
    {/* Right: Notification Options */}
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Applications Checkbox */}
      <div className="flex flex-row xs:flex-row items-start gap-2 xs:gap-4">
        <Checkbox
          checked={notifications.applications}
          onCheckedChange={() => onChange('applications')}
          disabled={disabled}
          aria-label="Toggle application notifications"
          className="w-6 h-6 rounded-[5px] border-2 border-primary data-[state=checked]:bg-[var(--icon-accent-primary,#4338CA)] data-[state=checked]:text-white data-[state=unchecked]:bg-white"
        />
        <div className="flex flex-col gap-1">
          <div
            className="text-[16px] font-medium font-['Lexend_Deca']"
            style={{ color: 'var(--text-primary, #0F172A)' }}
          >
            Applications
          </div>
          <div
            className="text-base font-normal font-['Be_Vietnam_Pro'] max-w-[336px]"
            style={{ color: 'var(--text-secondary, #475569)' }}
          >
            Send push notifications for jobs that you have applied to
          </div>
        </div>
      </div>
      {/* Jobs Checkbox */}
      <div className="flex flex-row xs:flex-row items-start gap-2 xs:gap-4">
        <Checkbox
          checked={notifications.jobs}
          onCheckedChange={() => onChange('jobs')}
          disabled={disabled}
          aria-label="Toggle job notifications"
          className="w-6 h-6 rounded-[5px] border-2 border-primary data-[state=checked]:bg-[var(--icon-accent-primary,#4338CA)] data-[state=checked]:text-white data-[state=unchecked]:bg-white"
        />
        <div className="flex flex-col gap-1">
          <div
            className="text-[16px] font-medium font-['Lexend_Deca']"
            style={{ color: 'var(--text-primary, #0F172A)' }}
          >
            Jobs
          </div>
          <div
            className="text-base font-normal font-['Be_Vietnam_Pro'] max-w-[336px]"
            style={{ color: 'var(--text-secondary, #475569)' }}
          >
            Send push notifications for job openings that suit your profile
          </div>
        </div>
      </div>
      {/* Recommendations Checkbox */}
      <div className="flex flex-row xs:flex-row items-start gap-2 xs:gap-4">
        <Checkbox
          checked={notifications.recommendations}
          onCheckedChange={() => onChange('recommendations')}
          disabled={disabled}
          aria-label="Toggle recommendation notifications"
          className="w-6 h-6 rounded-[5px] border-2 border-primary data-[state=checked]:bg-[var(--icon-accent-primary,#4338CA)] data-[state=checked]:text-white data-[state=unchecked]:bg-white"
        />
        <div className="flex flex-col gap-1">
          <div
            className="text-[16px] font-medium font-['Lexend_Deca']"
            style={{ color: 'var(--text-primary, #0F172A)' }}
          >
            Recommendations
          </div>
          <div
            className="text-base font-normal font-['Be_Vietnam_Pro'] max-w-[336px]"
            style={{ color: 'var(--text-secondary, #475569)' }}
          >
            Send push notifications for personalized recommendations from our
            recruiters
          </div>
        </div>
      </div>
      {/* Messages Checkbox */}
      <div className="flex flex-row items-start gap-4">
        <Checkbox
          checked={notifications.messages}
          onCheckedChange={() => onChange('messages')}
          disabled={disabled}
          aria-label="Toggle message notifications"
          className="w-6 h-6 rounded-[5px] border-2 border-primary data-[state=checked]:bg-[var(--icon-accent-primary,#4338CA)] data-[state=checked]:text-white data-[state=unchecked]:bg-white"
        />

        <div className="flex flex-col gap-1">
          <div
            className="text-[16px] font-medium font-['Lexend_Deca']"
            style={{ color: 'var(--text-primary, #0F172A)' }}
          >
            Messages
          </div>

          <div
            className="text-base font-normal font-['Be_Vietnam_Pro'] max-w-[336px]"
            style={{ color: 'var(--text-secondary, #475569)' }}
          >
            Send push notifications when you receive a new message
          </div>
        </div>
      </div>
    </div>
  </div>
);
