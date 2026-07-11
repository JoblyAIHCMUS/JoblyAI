'use client';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useListJobs } from '@/api-hook/jobs/useListJobs';
import { useEffect, useState } from 'react';
import { useUser } from '@/hooks/useUser';

export default function LatestJobsSection() {
  const { fetchJobs, data, loading } = useListJobs();
  const { data: user } = useUser();
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs({ pageSize: 8, sort: 'NEWEST' });
  }, [fetchJobs]);

  const latestJobs = data?.jobs || [];
  const handleLogoError = (url: string) => {
    setFailedLogos((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Latest <span className="text-indigo-600">jobs open</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {latestJobs.map((job) => {
              const jobHref =
                user?.role === 'candidate'
                  ? `/candidate/find-jobs/${job.id}`
                  : `/find-jobs/${job.id}`;
              return (
                <Link
                  key={job.id}
                  href={jobHref}
                  className="p-4 md:p-6 border border-slate-200 rounded-lg bg-white hover:shadow-lg transition flex gap-3 md:gap-6"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-300 rounded-full flex-shrink-0 overflow-hidden">
                    {job.company.logoUrl &&
                    !failedLogos.has(job.company.logoUrl) ? (
                      <img
                        src={job.company.logoUrl}
                        alt={job.company.name}
                        className="w-full h-full object-cover"
                        onError={() => handleLogoError(job.company.logoUrl)}
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-xl font-bold text-slate-900 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 mb-3">
                      {job.company.name} • {job.location}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 md:px-3 py-1 bg-teal-100 text-teal-600 text-xs font-semibold rounded-full">
                        {job.type.replace('_', ' ')}
                      </span>
                      {job.requirements.slice(0, 2).map((req) => (
                        <span
                          key={req.skillId}
                          className="px-2 md:px-3 py-1 border border-orange-500 text-orange-500 text-xs font-semibold rounded-full"
                        >
                          {req.skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
