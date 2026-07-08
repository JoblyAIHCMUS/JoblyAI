'use client';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useListJobs } from '@/api-hook/jobs/useListJobs';
import { getCardPreviewText } from '@/lib/utils';
import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

export default function FeaturedJobsSection() {
  const { fetchJobs, data, loading } = useListJobs();
  const { data: user } = useUser();

  useEffect(() => {
    fetchJobs({ pageSize: 8 });
  }, [fetchJobs]);

  const featuredJobs = data?.jobs || [];

  return (
    <section className="py-16 px-4 md:px-8 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6 px-2 md:px-0">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Featured <span className="text-indigo-600">jobs</span>
          </h2>
          <Link
            href="/find-jobs"
            className="text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-700 whitespace-nowrap"
          >
            Show all jobs <ArrowRight className="w-6 h-6" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 px-2 mx-2 snap-x snap-mandatory scrollbar-hide">
              {featuredJobs.map((job) => {
                const jobHref =
                  user?.role === 'candidate'
                    ? `/candidate/find-jobs/${job.id}`
                    : `/find-jobs/${job.id}`;
                return (
                  <Link
                    key={job.id}
                    href={jobHref}
                    className="min-w-[280px] w-[280px] p-5 border border-slate-200 rounded-lg bg-white hover:shadow-lg transition snap-start flex-shrink-0 block"
                  >
                    <div className="w-12 h-12 bg-slate-300 rounded-full mb-4 overflow-hidden">
                      {job.company.logoUrl ? (
                        <img
                          src={job.company.logoUrl}
                          alt={job.company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="inline-block px-3 py-1 border border-indigo-600 text-indigo-600 text-xs font-semibold rounded mb-4">
                      {job.type.replace('_', ' ')}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {job.company.name} • {job.location}
                    </p>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                      {getCardPreviewText(job.description)}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {job.requirements.slice(0, 2).map((req) => (
                        <span
                          key={req.skillId}
                          className="px-3 py-1 bg-teal-100 text-teal-600 text-xs font-semibold rounded-full"
                        >
                          {req.skillName}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {featuredJobs.map((job) => {
                const jobHref =
                  user?.role === 'candidate'
                    ? `/candidate/find-jobs/${job.id}`
                    : `/find-jobs/${job.id}`;
                return (
                  <Link
                    key={job.id}
                    href={jobHref}
                    className="p-5 md:p-6 border border-slate-200 rounded-lg bg-white hover:shadow-lg transition block"
                  >
                    <div className="w-12 h-12 bg-slate-300 rounded-full mb-4 overflow-hidden">
                      {job.company.logoUrl ? (
                        <img
                          src={job.company.logoUrl}
                          alt={job.company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="inline-block px-3 py-1 border border-indigo-600 text-indigo-600 text-xs font-semibold rounded mb-4">
                      {job.type.replace('_', ' ')}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {job.company.name} • {job.location}
                    </p>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                      {getCardPreviewText(job.description)}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {job.requirements.slice(0, 2).map((req) => (
                        <span
                          key={req.skillId}
                          className="px-3 py-1 bg-teal-100 text-teal-600 text-xs font-semibold rounded-full"
                        >
                          {req.skillName}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
