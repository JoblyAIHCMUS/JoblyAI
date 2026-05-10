'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { JobPosting } from '@/api-client/jobs/types';
import { ViewMode } from '@/types/job';
import { useRole } from '@/contexts/role-context';
import { SubmitApplicationModal } from '@/components/find-jobs/submit-application-modal';

function formatJobType(type: string): string {
  return type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatSalaryRange(
  salaryMin: number | null,
  salaryMax: number | null,
  currency: string | null
): string {
  if (!salaryMin && !salaryMax) {
    return 'Salary not specified';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (salaryMin && salaryMax) {
    return `${formatter.format(salaryMin)} - ${formatter.format(salaryMax)}`;
  }

  return salaryMin
    ? `From ${formatter.format(salaryMin)}`
    : salaryMax
    ? `Up to ${formatter.format(salaryMax)}`
    : 'Salary not specified';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const role = useRole();
  const router = useRouter();
  const jobHref =
    role === 'candidate'
      ? `/candidate/find-jobs/${job.id}`
      : `/find-jobs/${job.id}`;

  // Gate apply button by role - only candidates can apply
  const canApply = role === 'candidate';

  const handleApply = () => {
    if (canApply) {
      // Candidate: open modal
      setIsModalOpen(true);
    } else {
      // Non-candidates (guest, employer, admin): redirect to login
      router.push(`/login?redirect=${encodeURIComponent(jobHref)}`);
    }
  };

  const applyButtonClass = canApply
    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
    : 'bg-slate-300 text-slate-500 cursor-not-allowed';

  const handleApplicationSuccess = (message: string) => {
    toast.success(message);
  };

  const handleApplicationError = (error: string) => {
    toast.error(error);
  };

  return (
    <>
      <article
        className={`flex flex-col gap-4 rounded-xl border border-slate-200 p-5 ${
          viewMode === 'grid'
            ? 'h-full'
            : 'lg:flex-row lg:items-center lg:justify-between'
        }`}
      >
        <Link
          href={jobHref}
          className="flex min-w-0 items-start gap-4 hover:opacity-80 transition-opacity"
        >
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
            <h3 className="heading-h6-semi-bold text-slate-900">{job.title}</h3>
            <p className="body-body-1-regular mt-1 text-slate-600">
              {job.location
                ? `${job.company.name} - ${job.location}`
                : job.company.name}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center rounded-full bg-teal-100 px-2 py-1 label-label-2-semi-bold text-teal-500`}
              >
                {formatJobType(job.type)}
              </span>
              {job.requirements.map((requirement) => (
                <span
                  key={requirement.skillId}
                  className={`inline-flex items-center rounded-full border px-2 py-1 label-label-2-semi-bold ${getColorForSkill(
                    requirement.skillName
                  )}`}
                >
                  {requirement.skillName}
                </span>
              ))}
            </div>
          </div>
        </Link>

        <div
          className={`flex w-full flex-col items-start gap-3 ${
            viewMode === 'grid' ? '' : 'lg:w-[196px] lg:items-end'
          }`}
        >
          <button
            onClick={handleApply}
            disabled={!canApply}
            className={`h-11 w-full rounded-[6px] text-sm font-semibold transition-colors lg:w-[168px] ${applyButtonClass}`}
            title={
              !canApply ? 'Only candidates can apply' : 'Apply for this job'
            }
          >
            {!canApply ? 'Sign in to Apply' : 'Apply'}
          </button>
          <div className="w-full lg:w-[168px]">
            <p className="mb-1 text-xs font-semibold text-slate-500">Salary</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
            </p>
          </div>
        </div>
      </article>

      <SubmitApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={{
          id: job.id,
          title: job.title,
          company: job.company.name,
          location: job.location,
          jobType: job.type,
          logoUrl: job.company.logoUrl || undefined,
        }}
        onSuccess={handleApplicationSuccess}
        onError={handleApplicationError}
      />
    </>
  );
}
