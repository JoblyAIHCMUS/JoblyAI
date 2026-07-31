'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import type { ApplicationRecord } from '@/api-client/application';
import { JobPosting } from '@/api-client/jobs/types';
import { ViewMode } from '@/types/job';
import { SubmitApplicationModal } from '@/components/find-jobs/submit-application-modal';
import { PreShortlistEligibilityModal } from '@/components/find-jobs/PreShortlistEligibilityModal';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePostSubmitEligibility } from '@/hooks/usePostSubmitEligibility';
import { useUser } from '@/hooks/useUser';

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
  hasApplied: boolean;
  onApplySuccess?: (jobId: number) => void;
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

export default function JobCard({
  job,
  viewMode,
  hasApplied,
  onApplySuccess,
}: JobCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [eligibleApp, setEligibleApp] = useState<ApplicationRecord | null>(
    null
  );
  const { data: user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRole = user?.role ?? null;
  const activeResumeId = searchParams.get('resumeId');
  const baseHref =
    userRole === 'candidate'
      ? `/candidate/find-jobs/${job.id}`
      : `/find-jobs/${job.id}`;
  const jobHref =
    userRole === 'candidate' && activeResumeId
      ? `${baseHref}?resumeId=${activeResumeId}`
      : baseHref;

  // Gate apply button by role - only candidates can apply
  const isGuest = !user;
  const canApplyRole = userRole === 'candidate';

  const isDisabled = !!user && (!canApplyRole || hasApplied);

  const handleApply = () => {
    if (canApplyRole) {
      // Candidate: open modal if not already applied
      if (!hasApplied) setIsModalOpen(true);
    } else if (!user) {
      // Guest: redirect to login
      router.push(`/login?redirect=${encodeURIComponent(jobHref)}`);
    }
  };

  const applyButtonClass = isDisabled
    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
    : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer';

  const { handleApplicationSuccess } = usePostSubmitEligibility({
    job,
    onEligible: (record) => {
      onApplySuccess?.(job.id);
      setEligibleApp(record);
    },
    onNotEligible: () => {
      onApplySuccess?.(job.id);
      toast.success(`Application submitted for ${job.title}`);
    },
  });

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
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-slate-900'
            }
          >
            {job.company.logoUrl && !logoError ? (
              <img
                src={job.company.logoUrl}
                alt={job.company.name || job.title}
                className="h-full w-full object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-lg font-semibold text-slate-900">
                {(job.company.name || job.title).charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="heading-h6-semi-bold text-slate-900">
                {job.title}
              </h3>
              {job.matchPercentage !== undefined &&
                job.matchPercentage !== null && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                        <Star size={10} className="fill-current" />
                        {Math.round(job.matchPercentage)}% semantic
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-sm p-4 shadow-lg"
                    >
                      <p className="font-semibold text-sm mb-2">
                        How this score is calculated
                      </p>
                      <p className="text-xs leading-relaxed mb-2">
                        This match score is an AI-generated estimate based on
                        how closely your resume aligns with the job posting. It
                        gives you a quick sense of fit, but it is only an
                        approximation.
                      </p>
                      <p className="text-xs leading-relaxed mb-2">
                        The score looks at the overlap between the skills,
                        experience, and keywords in your resume and those
                        mentioned in the job. A higher score means a stronger
                        match on paper, but it cannot capture everything.
                      </p>
                      <p className="text-xs leading-relaxed font-medium">
                        Always read the full job description and required
                        qualifications before deciding whether to apply. The
                        description has details that the score may not reflect.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              {job.exactMatchPercentage !== undefined &&
                job.exactMatchPercentage !== null && (
                  <div className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                    {Math.round(job.exactMatchPercentage)}% exact
                  </div>
                )}
            </div>
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
            disabled={isDisabled}
            className={`h-11 w-full rounded-[6px] text-sm font-semibold transition-colors lg:w-[168px] ${applyButtonClass}`}
            title={
              isGuest
                ? 'Sign in to apply'
                : !canApplyRole
                ? 'Only candidates can apply'
                : hasApplied
                ? 'You have already applied'
                : 'Apply for this job'
            }
          >
            {isGuest ? 'Sign in to Apply' : hasApplied ? 'Applied' : 'Apply'}
          </button>
          <div className="w-full lg:w-[168px]">
            <p className="mb-1 text-xs font-semibold text-slate-500">Salary</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
            </p>
          </div>
        </div>
      </article>

      {canApplyRole ? (
        <>
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
          <PreShortlistEligibilityModal
            open={!!eligibleApp}
            applicationId={eligibleApp?.id ?? null}
            questionCount={eligibleApp?.preShortlistQuestionsCount ?? 0}
            onClose={() => setEligibleApp(null)}
            onAnswer={() => {
              const id = eligibleApp?.id;
              setEligibleApp(null);
              if (id) router.push(`/candidate/pre-shortlist/${id}`);
            }}
          />
        </>
      ) : null}
    </>
  );
}
