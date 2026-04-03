import { JobPosting } from '@/api-client/jobs/types';
import { ViewMode } from '@/types/job';

function formatJobType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

type JobCardProps = {
  job: JobPosting;
  viewMode: ViewMode;
};

function getColorForSkill(skill: string): string {
  let hash = 0; 
  for (let i = 0; i < skill.length; i++) {
    hash = skill.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    'border-red-500 text-red-500',
    'border-green-500 text-green-500',
    'border-blue-500 text-blue-500',
    'border-yellow-500 text-yellow-500',
    'border-indigo-500 text-indigo-500',
    'border-teal-500 text-teal-500',
    'border-orange-500 text-orange-500',
    'border-cyan-500 text-cyan-500',
  ];
  return colors[Math.abs(hash) % colors.length];
}


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
          <h3 className="heading-h6-semi-bold text-slate-900">
            {job.title}
          </h3>
          <p className="body-body-1-regular mt-1 text-slate-600">
            {job.company.name} - {job.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`inline-flex items-center rounded-full bg-teal-100 px-2 py-1 label-label-2-semi-bold text-teal-500`}>
              {formatJobType(job.type)}
            </span>
            {job.skills.map((skill) => (
              <span
                key={skill}
                className={`inline-flex items-center rounded-full border px-2 py-1 label-label-2-semi-bold ${getColorForSkill(skill)}`}
              >
                {skill}
              </span>
            ))}
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
