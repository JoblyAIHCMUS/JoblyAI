import { JobPosting } from '@/api-client/jobs/types';
import { ViewMode } from '@/types/job';

type JobCardProps = {
  job: JobPosting;
  viewMode: ViewMode;
};

export default function JobCard({ job, viewMode }: JobCardProps) {
  return (
    <article
      className={`flex flex-col gap-4 rounded-xl border border-slate-200 p-5 ${
        viewMode === 'grid'
          ? 'h-full'
          : 'lg:flex-row lg:items-center lg:justify-between'
      }`}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-slate-900'
          }
        >
          {job.company.logoUrl ? (
            <img
              src={job.company.logoUrl}
              alt={job.company.name || job.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-slate-900">
              {(job.company.name || job.title).charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-2xl font-semibold leading-8 text-slate-900">
            {job.title}
          </h3>
          <p className="mt-0.5 text-lg leading-7 text-slate-500">
            {job.company.name || ''}
            {job.company.name && job.location ? ' • ' : ''}
            {job.location || ''}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600">
              Full-Time
            </span>
            <span className="rounded-full border border-orange-300 px-3 py-1 text-xs font-medium text-orange-500">
              Marketing
            </span>
            <span className="rounded-full border border-indigo-300 px-3 py-1 text-xs font-medium text-indigo-500">
              Design
            </span>
          </div>
        </div>
      </div>

      <div
        className={`flex w-full flex-col items-start gap-3 ${
          viewMode === 'grid' ? '' : 'lg:w-[196px] lg:items-end'
        }`}
      >
        <button className="h-11 w-full rounded-[6px] bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 lg:w-[168px]">
          Apply
        </button>
        <div className="w-full lg:w-[168px]">
          <p className="mb-1 text-xs font-semibold text-slate-500">
            5 applied of 10 capacity
          </p>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 w-1/2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </article>
  );
}
