import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { similarJobService } from '@/services/similarJobService';
import type { SimilarJob } from '@/types/similarJob';

function SimilarJobCard({ job }: { job: SimilarJob }) {
  return (
    <Link href={`/find-jobs/${job.id}`} className="block">
      <article className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-slate-900 ${job.logoColor}`}
        >
          {job.logo}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-6 text-slate-900 truncate">
            {job.title}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {job.company} &bull; {job.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-600">
              {job.type}
            </span>
            <span className="rounded-full border border-orange-300 px-3 py-1 text-xs font-medium text-orange-500">
              {job.tag}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function JobDetailSimilarJobs() {
  const similarJobs = similarJobService.getSimilarJobs();

  return (
    <section className="bg-white py-[72px] border-t border-slate-100">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[28px] sm:text-[32px] font-semibold text-slate-900">
            Similar Jobs
          </h2>
          <Link
            href="/find-jobs"
            className="flex items-center gap-1 text-indigo-600 font-semibold text-base hover:text-indigo-700 transition-colors"
          >
            Show all jobs
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
