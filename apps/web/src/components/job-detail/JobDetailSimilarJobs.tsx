'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useSimilarJobs } from '@/api-hook/jobs';
import type { JobPosting } from '@/types/job';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/role-context';

function SimilarJobCard({ job }: { job: JobPosting }) {
  const role = useRole();
  const jobHref =
    role === 'candidate'
      ? `/candidate/find-jobs/${job.id}`
      : `/find-jobs/${job.id}`;

  const [logoError, setLogoError] = useState(false);
  const companyInitial = job.company.name.charAt(0);
  const showLogoFallback = !job.company.logoUrl || logoError;

  return (
    <Link href={jobHref} className="block">
      <article className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all h-full">
        {showLogoFallback ? (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg font-semibold leading-none text-indigo-700">
            {companyInitial.toUpperCase()}
          </div>
        ) : (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={job.company.logoUrl as string}
              alt={job.company.name}
              fill
              className="object-cover"
              onError={() => setLogoError(true)}
            />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-6 text-slate-900 truncate">
            {job.title}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {job.company.name} &bull; {job.location || 'Remote'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600">
              {job.type.replace('_', ' ')}
            </span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              {job.category.name}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function JobDetailSimilarJobs({
  jobId,
  companyId,
  location,
  title = 'Similar Jobs',
  limit = 6,
  href = '/find-jobs',
  ctaLabel = 'Show all jobs',
  className,
}: {
  jobId?: number;
  companyId?: number;
  location?: string;
  title?: string;
  limit?: number;
  href?: string;
  ctaLabel?: string;
  className?: string;
}) {
  const { fetchSimilarJobs, data: similarJobs, loading } = useSimilarJobs();

  useEffect(() => {
    if (jobId || companyId || location) {
      void fetchSimilarJobs({ jobId, companyId, location, limit });
    }
  }, [jobId, companyId, location, limit, fetchSimilarJobs]);

  if (loading) {
    return (
      <section
        className={cn(
          'border-t border-slate-100 bg-white py-[72px]',
          className
        )}
      >
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse flex items-center justify-between mb-10">
            <div className="h-10 w-48 bg-slate-200 rounded"></div>
            <div className="h-6 w-24 bg-slate-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (similarJobs.length === 0) {
    return null;
  }

  return (
    <section
      className={cn('border-t border-slate-100 bg-white py-[72px]', className)}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[28px] sm:text-[32px] font-semibold text-slate-900">
            {title}
          </h2>
          <Link
            href={href}
            className="flex items-center gap-1 text-indigo-600 font-semibold text-base hover:text-indigo-700 transition-colors"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {similarJobs.map((job) => (
            <SimilarJobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
