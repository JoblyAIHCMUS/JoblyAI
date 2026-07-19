'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useTopCompanies } from '@/hooks/useTopCompanies';

export default function CompaniesSection() {
  const { companies, loading } = useTopCompanies(5);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  const handleLogoError = (url: string) => {
    setFailedLogos((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg md:text-xl font-medium text-slate-900 mb-6 md:mb-8">
            Companies hiring
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 place-items-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-32 h-16 bg-slate-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 px-4 md:px-8 lg:px-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg md:text-xl font-medium text-slate-900 mb-6 md:mb-8">
          Top companies hiring
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 place-items-center">
          {companies.map((company) => {
            const logoFailed = company.logoUrl
              ? failedLogos.has(company.logoUrl)
              : true;
            return (
              <Link
                key={company.id}
                href={`/browse-companies/${company.id}`}
                className="relative flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 w-32 h-16 hover:scale-105"
              >
                {company.logoUrl && !logoFailed ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    width={128}
                    height={64}
                    className="object-contain"
                    onError={() => handleLogoError(company.logoUrl!)}
                  />
                ) : (
                  <div className="text-center text-sm font-medium text-slate-600">
                    {company.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
