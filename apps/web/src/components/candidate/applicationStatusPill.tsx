import { ApplicationStatus, ApplicationStatusMeta } from '@/types/candidate';

type ApplicationStatusPillProps = {
  status: ApplicationStatus;
  statusMeta: ApplicationStatusMeta;
  compact?: boolean;
};

export function ApplicationStatusPill({
  status,
  statusMeta,
  compact = false,
}: ApplicationStatusPillProps) {
  const { label, className } = statusMeta[status];

  return (
    <span
      className={`inline-flex rounded-full border font-semibold ${
        compact
          ? 'px-2.5 py-1 text-xs leading-5 sm:text-sm'
          : 'px-2.5 py-1.5 text-xs leading-4 sm:px-3 sm:py-2 sm:text-sm sm:leading-5'
      } ${className}`}
    >
      {label}
    </span>
  );
}
