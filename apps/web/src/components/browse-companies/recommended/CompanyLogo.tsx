'use client';

import { useState } from 'react';
import type { RecommendedCompany } from '@/types/recommendedCompany';

export default function CompanyLogo({
  company,
}: {
  company: RecommendedCompany;
}) {
  const roundedClassName =
    company.logo.rounded === 'square' ? 'rounded-none' : 'rounded-full';
  const [logoError, setLogoError] = useState(false);
  const showFallback = !company.logo.imageUrl || logoError;

  return (
    <div
      className={`inline-flex h-20 w-20 items-center justify-center overflow-hidden ${roundedClassName} ${
        showFallback ? 'bg-indigo-100' : 'bg-white'
      }`}
    >
      {showFallback ? (
        <span className="text-2xl font-bold leading-none text-indigo-700">
          {company.name.charAt(0)}
        </span>
      ) : (
        <img
          src={company.logo.imageUrl}
          alt={company.logo.alt}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setLogoError(true)}
        />
      )}
    </div>
  );
}
