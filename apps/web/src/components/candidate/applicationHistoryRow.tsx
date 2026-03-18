import { MoreHorizontal } from 'lucide-react';

import { ApplicationItem, ApplicationStatusMeta } from '@/types/candidate';
import { ApplicationStatusPill } from '@/components/candidate/applicationStatusPill';
import { formatCreatedAtForDisplay } from '@/lib/candidateDate';
import { getInitials } from '@/lib/utils';

export function ApplicationHistoryRow({
  item,
  index,
  tinted,
  statusMeta,
}: {
  item: ApplicationItem;
  index: number;
  tinted: boolean;
  statusMeta: ApplicationStatusMeta;
}) {
  const initials = getInitials(item.company);
  const displayCreatedAt = formatCreatedAtForDisplay(item.createdAt);

  const logoNode = item.logoUrl ? (
    <img
      src={item.logoUrl}
      alt={`${item.company} logo`}
      className="h-10 w-10 rounded-[12px] border border-[#e7ebf3] bg-white object-cover"
    />
  ) : (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#7fd4b1] text-sm font-semibold text-white"
    >
      {initials}
    </div>
  );

  return (
    <div
      className={`rounded-[2px] px-4 py-4 lg:px-6 ${
        tinted ? 'bg-[#f8f8fd]' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          {logoNode}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[#25324b]">
              {item.company}
            </p>
            <p className="truncate text-sm text-[#7c8493]">{item.title}</p>
          </div>
        </div>
        <ApplicationStatusPill
          status={item.status}
          statusMeta={statusMeta}
          compact
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-[#7c8493] lg:hidden">
        <span>#{index}</span>
        <span>{displayCreatedAt}</span>
      </div>

      <div className="hidden items-center gap-5 lg:grid lg:grid-cols-[56px_221px_275px_194px_1fr_24px]">
        <p className="text-base text-[#25324b]">{index}</p>

        <div className="flex min-w-0 items-center gap-2">
          <div className="shrink-0">{logoNode}</div>
          <p className="truncate text-base font-medium text-[#25324b]">
            {item.company}
          </p>
        </div>

        <p className="truncate text-base text-[#25324b]">{item.title}</p>
        <p className="text-base text-[#25324b]">{displayCreatedAt}</p>

        <div>
          <ApplicationStatusPill
            status={item.status}
            statusMeta={statusMeta}
            compact
          />
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
