'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Star } from 'lucide-react';

import { ApplicationItem, ApplicationStatusMeta } from '@/types/candidate';
import { ApplicationStatusPill } from '@/components/candidate/applicationStatusPill';
import { formatCreatedAtForDisplay } from '@/lib/candidateDate';
import { getInitials, cn } from '@/lib/utils';
import { isClosedApplicationStatus } from '@/lib/candidateStatus';

type ApplicationHistoryRowProps = {
  item: ApplicationItem;
  index: number;
  tinted: boolean;
  statusMeta: ApplicationStatusMeta;
  showMoreActions?: boolean;
  moreActionOptions?: string[];
  onMoreActionSelect?: (option: string, item: ApplicationItem) => void;
  onMessageRecruiter?: (item: ApplicationItem) => void;
};

const DEFAULT_MORE_ACTION_OPTIONS = [
  'View details',
  'Message recruiter',
  'Withdraw application',
];

function MoreActionsMenu({
  item,
  options,
  onSelect,
}: {
  item: ApplicationItem;
  options: string[];
  onSelect?: (option: string, item: ApplicationItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={`More actions for ${item.company}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-[#efeffd] hover:text-[#4640de] active:scale-95 ${
          isOpen ? 'bg-[#efeffd] text-[#4640de] shadow-sm' : 'text-[#25324b]'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute right-0 top-8 z-10 min-w-[180px] rounded-md border border-[#d6ddeb] bg-white p-1 shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#f8f8fd] ${
                option === 'Withdraw application'
                  ? 'text-[#ff6550] hover:bg-[#fff1f0]'
                  : 'text-[#25324b]'
              }`}
              onClick={() => {
                onSelect?.(option, item);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ApplicationHistoryRow({
  item,
  index,
  tinted,
  statusMeta,
  showMoreActions = true,
  moreActionOptions = DEFAULT_MORE_ACTION_OPTIONS,
  onMoreActionSelect,
  onMessageRecruiter,
}: ApplicationHistoryRowProps) {
  const router = useRouter();
  const initials = getInitials(item.company);
  const displayCreatedAt = formatCreatedAtForDisplay(item.createdAt);

  // Filter out "Withdraw application" if the job is already closed or candidate was rejected/offered
  const filteredOptions = useMemo(() => {
    if (moreActionOptions !== DEFAULT_MORE_ACTION_OPTIONS) {
      return moreActionOptions;
    }

    if (isClosedApplicationStatus(item.status)) {
      return DEFAULT_MORE_ACTION_OPTIONS.filter(
        (opt) => opt !== 'Withdraw application'
      );
    }

    return DEFAULT_MORE_ACTION_OPTIONS;
  }, [item.status, moreActionOptions]);

  const handleRowClick = () => {
    // If the job is closed (deleted), navigating might lead to a 404.
    // However, we allow navigation so the user can see the 404/Not Found page
    // which should ideally handle the "Job no longer available" state.
    router.push(`/candidate/find-jobs/${item.jobId}`);
  };

  const handleMoreActionSelect = (
    option: string,
    currentItem: ApplicationItem
  ) => {
    if (option === 'View details') {
      router.push(`/candidate/find-jobs/${currentItem.jobId}`);
    } else if (option === 'Message recruiter' && onMessageRecruiter) {
      onMessageRecruiter(currentItem);
    }
    onMoreActionSelect?.(option, currentItem);
  };

  const mobileLogoNode = item.logoUrl ? (
    <img
      src={item.logoUrl}
      alt={`${item.company} logo`}
      className="h-16 w-16 rounded-[18px] border border-[#e7ebf3] bg-white object-cover"
    />
  ) : (
    <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#7fd4b1] text-lg font-semibold text-white">
      {initials}
    </div>
  );

  const desktopLogoNode = item.logoUrl ? (
    <img
      src={item.logoUrl}
      alt={`${item.company} logo`}
      className="h-10 w-10 rounded-[12px] border border-[#e7ebf3] bg-white object-cover"
    />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#7fd4b1] text-sm font-semibold text-white">
      {initials}
    </div>
  );

  return (
    <div
      onClick={handleRowClick}
      className={`group w-full min-w-0 cursor-pointer rounded-[10px] px-4 py-4 transition-colors hover:border-[#d6ddeb] hover:shadow-sm lg:rounded-[2px] lg:px-5 xl:px-6 ${
        tinted
          ? 'bg-[#f8f8fd] hover:bg-[#f0f0fa]'
          : 'bg-white hover:bg-[#f8f8fd]'
      }`}
    >
      <div className="flex flex-col gap-2 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          {mobileLogoNode}
          {showMoreActions && (
            <div onClick={(e) => e.stopPropagation()}>
              <MoreActionsMenu
                item={item}
                options={filteredOptions}
                onSelect={handleMoreActionSelect}
              />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="break-words font-[family-name:var(--family-primary)] text-[clamp(1.125rem,4.8vw,1.25rem)] font-semibold leading-6 text-[#25324b]">
              {item.title}
            </p>
            {item.matchPercentage !== undefined &&
            item.matchPercentage !== null ? (
              <div
                className={cn(
                  'flex items-center gap-1 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold',
                  item.matchPercentage >= 80
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : item.matchPercentage >= 50
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                )}
                title={`AI Match Score: ${Math.round(item.matchPercentage)}%`}
              >
                <Star size={10} className="fill-current" />
                {Math.round(item.matchPercentage)}%
              </div>
            ) : (
              <div
                className="flex items-center gap-1 shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 animate-pulse"
                title="AI is calculating your match score..."
              >
                AI Processing...
              </div>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-6 text-[#515b6f] sm:text-base">
            <span className="break-words">{item.company}</span>
            <span className="h-1 w-1 rounded-full bg-[#515b6f]" />
            <span className="break-words">{item.location}</span>
            <span className="h-1 w-1 rounded-full bg-[#515b6f]" />
            <span className="break-words">{item.jobType}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm leading-[22px] text-[#515b6f] sm:text-base">
              Date Applied
            </p>
            <p className="break-words text-sm font-medium leading-6 text-[#25324b] sm:text-base">
              {displayCreatedAt}
            </p>
          </div>
          <div className="shrink-0">
            <ApplicationStatusPill
              status={item.status}
              statusMeta={statusMeta}
              compact
            />
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-3 lg:grid lg:grid-cols-[48px_minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(120px,0.9fr)_minmax(110px,0.8fr)_24px] xl:gap-5 xl:grid-cols-[56px_221px_275px_194px_1fr_24px]">
        <p className="text-base text-[#25324b]">{index}</p>

        <div className="flex min-w-0 items-center gap-2">
          <div className="shrink-0">{desktopLogoNode}</div>
          <p className="truncate text-base font-medium text-[#25324b]">
            {item.company}
          </p>
        </div>

        <div className="flex flex-col min-w-0">
          <p className="truncate text-base text-[#25324b] font-medium">
            {item.title}
          </p>
          {item.matchPercentage !== undefined &&
          item.matchPercentage !== null ? (
            <div
              className={cn(
                'mt-1 flex items-center gap-1 w-fit rounded-full border px-2 py-0.5 text-[10px] font-bold',
                item.matchPercentage >= 80
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : item.matchPercentage >= 50
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              )}
              title={`AI Match Score: ${Math.round(item.matchPercentage)}%`}
            >
              <Star size={10} className="fill-current" />
              {Math.round(item.matchPercentage)}% Match
            </div>
          ) : (
            <div
              className="mt-1 flex items-center gap-1 w-fit rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 animate-pulse"
              title="AI is calculating your match score..."
            >
              AI Processing...
            </div>
          )}
        </div>
        <p className="text-base text-[#25324b]">{displayCreatedAt}</p>

        <div>
          <ApplicationStatusPill
            status={item.status}
            statusMeta={statusMeta}
            compact
          />
        </div>

        {showMoreActions && (
          <div onClick={(e) => e.stopPropagation()}>
            <MoreActionsMenu
              item={item}
              options={filteredOptions}
              onSelect={handleMoreActionSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
