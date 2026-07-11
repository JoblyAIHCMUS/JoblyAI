'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CompanyProfile } from '@/types/companyProfile';

export default function CompanyTeamSection({
  company,
}: {
  company: CompanyProfile;
}) {
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set());

  const handleAvatarError = (url: string) => {
    setFailedAvatars((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-[72px]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
            Team
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-4 pb-2">
            {company.team.map((member) => {
              const showFallback = !member.avatarUrl || failedAvatars.has(member.avatarUrl);
              return (
                <Link
                  key={member.id}
                  id={`team-member-${member.id}`}
                  href={`/browse-companies/${company.id}/team/${member.id}`}
                  className="flex w-[240px] shrink-0 flex-col items-center gap-4 rounded-[5px] border border-slate-300 bg-white p-6 text-center transition-colors hover:border-indigo-400"
                >
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl font-semibold leading-none text-indigo-700">
                    {showFallback ? (
                      <span>{member.name.charAt(0).toUpperCase()}</span>
                    ) : (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={() => handleAvatarError(member.avatarUrl)}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium tracking-tight text-slate-900">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-base text-slate-600">{member.role}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
