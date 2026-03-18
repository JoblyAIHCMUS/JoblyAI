import { MoreHorizontal } from 'lucide-react';

import { ApplicationItem, ApplicationStatusMeta } from '@/types/candidate';
import { ApplicationStatusPill } from '@/components/candidate/applicationStatusPill';
import { formatCreatedAtForDisplay } from '@/lib/candidateDate';
import { getInitials } from '@/lib/utils';

function CompanyBadge({ item }: { item: ApplicationItem }) {
  const initials = getInitials(item.company);

  if (item.logoUrl) {
    return (
      <img
        src={item.logoUrl}
        alt={`${item.company} logo`}
        className="h-14 w-14 rounded-[18px] border border-[#e7ebf3] bg-white object-cover sm:h-16 sm:w-16 sm:rounded-[20px]"
      />
    );
  }

  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#7fd4b1] text-lg font-semibold text-white sm:h-16 sm:w-16 sm:rounded-[20px] sm:text-xl"
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
  const displayCreatedAt = formatCreatedAtForDisplay(item.createdAt);

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
          <p className="font-[family-name:var(--family-primary)] text-lg font-semibold leading-6 text-[#25324b] sm:text-[20px]">
            {item.title}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-5 text-[#515b6f] sm:text-base sm:leading-6">
            <span>{item.company}</span>
            <span className="h-1 w-1 rounded-full bg-[#515b6f]" />
            <span>{item.location}</span>
            <span className="h-1 w-1 rounded-full bg-[#515b6f]" />
            <span>{item.jobType}</span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm leading-5 text-[#515b6f] sm:text-base sm:leading-[22px]">
              Date Applied
            </p>
            <p className="text-sm font-medium leading-5 text-[#25324b] sm:text-base sm:leading-6">
              {displayCreatedAt}
            </p>
          </div>
          <ApplicationStatusPill status={item.status} statusMeta={statusMeta} />
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
          <p className="text-base leading-6 text-[#515b6f]">
            {displayCreatedAt}
          </p>
        </div>

        <div>
          <ApplicationStatusPill status={item.status} statusMeta={statusMeta} />
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
