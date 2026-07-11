'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Briefcase, CalendarDays, Globe, MapPin, Users } from 'lucide-react';
import type { CompanyProfile } from '@/types/companyProfile';

const statIconMap = {
  Founded: CalendarDays,
  Employees: Users,
  Location: MapPin,
  Industry: Briefcase,
};

const PATTERN_URL =
  'https://storage.googleapis.com/joblyai-public/assets/public/landing/Pattern.svg';

export default function CompanyDetailHero({
  company,
}: {
  company: CompanyProfile;
}) {
  const [logoError, setLogoError] = useState(false);
  const [patternError, setPatternError] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#F8F8FD] pt-16 sm:pt-20 lg:pt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#F8F8FD]" />

        <div className="absolute left-0 top-5 hidden h-[600px] w-[260px] overflow-hidden lg:block">
          {!patternError && (
            <Image
              src={PATTERN_URL}
              alt="Pattern left"
              width={834}
              height={436}
              className="absolute top-0 right-1/3 h-auto w-[400px] max-w-none opacity-90"
              style={{ height: 'auto' }}
              onError={() => setPatternError(true)}
            />
          )}
        </div>

        <div className="absolute right-0 top-20 h-[600px] w-[260px] overflow-hidden opacity-60 sm:w-[260px] sm:opacity-100 lg:w-[244px] lg:opacity-100">
          {!patternError && (
            <Image
              src={PATTERN_URL}
              alt="Pattern right"
              width={834}
              height={436}
              className="absolute left-2/3 top-1/2 h-auto w-[834px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-90"
              style={{ height: 'auto' }}
              onError={() => setPatternError(true)}
            />
          )}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1240px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-10">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500 sm:mb-7">
          <Link href="/" className="transition-colors hover:text-slate-700">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/browse-companies"
            className="transition-colors hover:text-slate-700"
          >
            Companies
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">{company.name}</span>
        </nav>

        <div className="rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-2xl sm:bg-transparent sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex items-start justify-between gap-4 sm:block">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-indigo-100 text-2xl font-semibold leading-none text-indigo-700 sm:h-20 sm:w-20 sm:rounded-xl sm:text-4xl">
                  {company.logoUrl && !logoError ? (
                    <img
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    company.name.slice(0, 1).toUpperCase()
                  )}
                </div>

                {company.openJobsCount > 0 && (
                  <div className="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 sm:px-4 sm:py-2 sm:text-sm sm:hidden">
                    {company.openJobsCount} open jobs
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
                      {company.name}
                    </h1>
                    {company.openJobsCount > 0 && (
                      <div className="hidden w-fit rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 md:inline-flex">
                        {company.openJobsCount} open jobs
                      </div>
                    )}
                  </div>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 text-sm text-indigo-700 underline-offset-2 transition-colors hover:text-indigo-800 hover:underline"
                    >
                      <Globe className="h-5 w-5" />
                      {company.website}
                    </a>
                  )}
                </div>

                {company.stats && company.stats.length > 0 && (
                  <div
                    className={`grid gap-3 sm:grid-cols-2 lg:gap-6 ${
                      company.stats.length === 1
                        ? 'lg:grid-cols-1'
                        : company.stats.length === 2
                        ? 'lg:grid-cols-2'
                        : company.stats.length === 3
                        ? 'lg:grid-cols-3'
                        : 'lg:grid-cols-4'
                    }`}
                  >
                    {company.stats.map((stat) => {
                      const Icon =
                        statIconMap[stat.label as keyof typeof statIconMap] ??
                        Globe;

                      return (
                        <div
                          key={stat.label}
                          className="flex items-start gap-3"
                        >
                          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                              {stat.label}
                            </p>
                            <p className="text-sm font-medium text-slate-900 sm:text-base">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
