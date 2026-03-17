import { MoreHorizontal } from 'lucide-react';

import {
  ApplicationItem,
  ApplicationStatus,
  ApplicationStatusMeta,
} from '../types';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function StatusPill({
  status,
  statusMeta,
}: {
  status: ApplicationStatus;
  statusMeta: Record<ApplicationStatus, { label: string; className: string }>;
}) {
  const { label, className } = statusMeta[status];

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-2 font-[family-name:var(--family-primary)] text-sm font-semibold leading-5 ${className}`}
    >
      {label}
    </span>
  );
}

function CompanyBadge({ item }: { item: ApplicationItem }) {
  const initials = getInitials(item.company);

  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-[20px] text-xl font-semibold text-white"
      style={{ backgroundColor: item.accent }}
    >
      {initials}
    </div>
  );
}

export function ApplicationRow({
  item,
  tinted,
  statusMeta,
}: {
  item: ApplicationItem;
  tinted: boolean;
  statusMeta: ApplicationStatusMeta;
}) {
  return (
    <div
      className={`rounded-[10px] lg:rounded-sm ${
        tinted ? 'bg-[#eef2ff]' : 'bg-white'
      }`}
    >
      {/* Mobile card layout */}
      <div className="flex flex-col gap-2 p-4 lg:hidden">
        <div className="flex items-start justify-between">
          <CompanyBadge item={item} />
          <button
            type="button"
            aria-label={`More actions for ${item.company}`}
            className="flex h-6 w-6 items-center justify-center text-[#25324b]"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div>
          <p className="font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-6 text-[#25324b]">
            {item.title}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-base leading-6 text-[#515b6f]">
            <span>{item.company}</span>
            <span className="h-1 w-1 rounded-full bg-[#515b6f]" />
            <span>{item.location}</span>
            <span className="h-1 w-1 rounded-full bg-[#515b6f]" />
            <span>{item.jobType}</span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-base leading-[22px] text-[#515b6f]">Date Applied</p>
            <p className="text-base font-medium leading-6 text-[#25324b]">{item.appliedDate}</p>
          </div>
          <StatusPill status={item.status} statusMeta={statusMeta} />
        </div>
      </div>

      {/* Desktop row layout */}
      <div className="hidden items-center gap-5 px-6 py-5 lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(150px,0.7fr)_117px_24px]">
        <div className="flex min-w-0 items-center gap-4">
          <CompanyBadge item={item} />
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-6 text-[#25324b]">
              {item.title}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-base leading-6 text-[#515b6f]">
              <span>{item.company}</span>
              <span className="h-1 w-1 rounded-full bg-[#515b6f]" />
              <span>{item.location}</span>
              <span className="h-1 w-1 rounded-full bg-[#515b6f]" />
              <span>{item.jobType}</span>
            </p>
          </div>
        </div>

        <div>
          <p className="text-base leading-6 text-[#515b6f]">{item.appliedDate}</p>
        </div>

        <div>
          <StatusPill status={item.status} statusMeta={statusMeta} />
        </div>

        <button
          type="button"
          aria-label={`More actions for ${item.company}`}
          className="flex h-6 w-6 items-center justify-center text-[#25324b]"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
