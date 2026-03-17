'use client';

import Link from 'next/link';
import {
  CalendarDays,
  ChevronRight,
  FileText,
  MessageCircleQuestion,
  MoreHorizontal,
} from 'lucide-react';

import { useUser } from '@/hooks/useUser';
import {
  ApplicationFilter,
  ApplicationStatusMeta,
  ApplicationItem,
  ApplicationStatus,
} from '../../../types/candidateDashboard';
import { useCandidateDashboard } from '../../../hooks/useCandidateDashboard';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[#d6ddeb] bg-white p-6">
      <div className="flex flex-col gap-7">
        <p className="font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-6 text-[#25324b]">
          {label}
        </p>
        <p className="font-[family-name:var(--family-primary)] text-[64px] font-medium leading-[80px] tracking-[-0.8px] text-[#25324b]">
          {value}
        </p>
      </div>
      <div className="absolute bottom-[-18px] right-[-12px] text-[#26a4ff]/30">
        {icon}
      </div>
    </div>
  );
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

function ApplicationRow({
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
      className={`grid items-center gap-5 rounded-sm px-6 py-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(150px,0.7fr)_117px_24px] ${
        tinted ? 'bg-[#eef2ff]' : 'bg-white'
      }`}
    >
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
        <p className="font-[family-name:var(--family-primary)] text-base font-medium leading-[22px] text-[#25324b]">
          Date Applied
        </p>
        <p className="mt-1 text-base leading-6 text-[#515b6f]">{item.appliedDate}</p>
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
  );
}

export default function CandidateDashboardPage() {
  const { data: user } = useUser();
  const {
    applicationFilter,
    setApplicationFilter,
    filteredApplications,
    paginatedApplications,
    currentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
    statusMeta,
    filterMeta,
  } = useCandidateDashboard();

  const firstName = user?.name?.split(' ')[0] ?? 'Jake';
  const greeting = getGreeting();
  const unsuitableShare = 60;

  return (
    <div className="min-h-full bg-white">
      <div className="flex flex-col gap-8 px-4 py-6 md:px-8 md:py-6">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="font-[family-name:var(--family-primary)] text-[32px] font-semibold leading-[38px] tracking-[-0.2px] text-[#25324b]">
              {greeting}, {firstName}
            </h2>
            <p className="mt-2 max-w-3xl text-base leading-6 text-[#7c8493]">
              Here is what&apos;s happening with your job search applications from July 19 - July 25.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-12 items-center gap-3 rounded-[6px] border border-[#d6ddeb] bg-white px-4 text-base font-medium text-[#515b6f]"
          >
            <span>Jul 19 - Jul 25</span>
            <CalendarDays className="h-4 w-4 text-[#4640de]" />
          </button>
        </section>

        <section className="grid gap-6 xl:grid-cols-[258px_1fr]">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard
              label="Total Jobs Applied"
              value={45}
              icon={<FileText className="h-28 w-28" strokeWidth={1.4} />}
            />
            <StatCard
              label="Interviewed"
              value={18}
              icon={<MessageCircleQuestion className="h-28 w-28" strokeWidth={1.4} />}
            />
          </div>

          <div className="rounded-[10px] border border-[#d6ddeb] bg-white p-6">
            <p className="font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-6 text-[#25324b]">
              Jobs Applied Status
            </p>

            <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6 lg:gap-8">
                <div className="relative h-[152px] w-[152px] rounded-full bg-[conic-gradient(#4338ca_0_60%,#eef2ff_60%_100%)] shadow-[0_14px_30px_rgba(70,64,222,0.08)]">
                  <div className="absolute inset-[20px] rounded-full bg-white" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="mt-1 h-5 w-5 rounded-[4px] bg-[#4338ca]" />
                    <div>
                      <p className="font-[family-name:var(--family-primary)] text-base font-semibold leading-[22px] text-[#25324b]">
                        60%
                      </p>
                      <p className="text-base leading-6 text-[#515b6f]">Unsuitable</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="mt-1 h-5 w-5 rounded-[4px] bg-[#eef2ff]" />
                    <div>
                      <p className="font-[family-name:var(--family-primary)] text-base font-semibold leading-[22px] text-[#25324b]">
                        {100 - unsuitableShare}%
                      </p>
                      <p className="text-base leading-6 text-[#515b6f]">Interviewed</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/candidate/dashboard#applications"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#4640de]"
              >
                View All Applications
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section
          id="applications"
          className="rounded-none border border-[#d6ddeb] bg-white p-6 md:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-6 text-[#25324b]">
              Recent Applications History
            </p>

            <div className="inline-flex w-full rounded-lg border border-[#d6ddeb] p-1 sm:w-auto">
              {(Object.keys(filterMeta) as ApplicationFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setApplicationFilter(filter)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none ${
                    applicationFilter === filter
                      ? 'bg-[#eef0ff] text-[#4640de]'
                      : 'text-[#7c8493] hover:text-[#25324b]'
                  }`}
                >
                  {filterMeta[filter].label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-7 h-px w-full bg-[#d6ddeb]" />

          <div className="mt-6 space-y-0">
            {paginatedApplications.map((item, index) => (
              <ApplicationRow
                key={item.id}
                item={item}
                tinted={index % 2 === 0}
                statusMeta={statusMeta}
              />
            ))}

            {filteredApplications.length === 0 && (
              <div className="rounded-sm bg-[#f8fafc] px-6 py-10 text-center text-sm text-[#7c8493]">
                No applications found for this filter.
              </div>
            )}
          </div>

          {filteredApplications.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-[#7c8493]">
                Page {currentPage} of {totalPages}
              </p>

              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-md border border-[#d6ddeb] px-3 py-1.5 text-sm font-medium text-[#515b6f] transition-colors enabled:hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-[#d6ddeb] px-3 py-1.5 text-sm font-medium text-[#515b6f] transition-colors enabled:hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <Link
            href="/candidate/dashboard#applications"
            className="mt-8 inline-flex items-center gap-3 font-[family-name:var(--family-primary)] text-base font-semibold leading-[22px] text-[#4640de]"
          >
            View all applications history
            <ChevronRight className="h-5 w-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}