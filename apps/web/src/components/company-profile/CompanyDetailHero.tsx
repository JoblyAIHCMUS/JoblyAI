import Link from 'next/link';
import Image from 'next/image';
import {
  Briefcase,
  CalendarDays,
  Globe,
  MapPin,
  Users,
} from 'lucide-react';
import type { CompanyProfile } from '@/types/companyProfile';

const statIconMap = {
  Founded: CalendarDays,
  Employees: Users,
  Location: MapPin,
  Industry: Briefcase,
};

export default function CompanyDetailHero({
  company,
}: {
  company: CompanyProfile;
}) {
  return (
    <section className="relative overflow-hidden bg-[#F8F8FD] pt-16 sm:pt-20 lg:pt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 hidden h-[436px] w-[520px] overflow-hidden opacity-60 lg:block">
          <Image
            src="/landing/Pattern.svg"
            alt=""
            width={834}
            height={436}
            className="absolute left-0 top-5 h-auto w-[834px] max-w-none"
          />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
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
          <span className="font-semibold text-slate-900">
            {company.breadcrumbLabel}
          </span>
        </nav>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-400 text-4xl font-semibold text-white shadow-sm">
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.logoAlt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  company.name.slice(0, 1).toUpperCase()
                )}
              </div>

              <div className="min-w-0 space-y-3">
                <div>
                  <h1 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
                    {company.name}
                  </h1>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-indigo-700"
                  >
                    <Globe className="h-4 w-4" />
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
                  {company.stats.map((stat) => {
                    const Icon =
                      statIconMap[stat.label as keyof typeof statIconMap] ?? Globe;

                    return (
                      <div key={stat.label} className="flex items-start gap-3">
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
              </div>
            </div>

            <div className="inline-flex w-fit rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              {company.openJobsCount} open jobs
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}