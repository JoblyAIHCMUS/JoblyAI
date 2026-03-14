import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';
import type { CompanyProfile } from '@/types/companyProfile';

export default function CompanyTeamSection({
  company,
}: {
  company: CompanyProfile;
}) {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-[72px]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px]">
            Team
          </h2>
          <Link
            href="/browse-companies"
            className="text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-800"
          >
            See all ({company.team.length})
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {company.team.map((member) => (
            <article
              key={member.id}
              className="flex flex-col items-center gap-4 rounded-[5px] border border-slate-300 bg-white p-6 text-center"
            >
              <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-100">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-xl font-medium tracking-tight text-slate-900">
                  {member.name}
                </h3>
                <p className="mt-1 text-base text-slate-600">{member.role}</p>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                {member.instagramUrl ? (
                  <a
                    href={member.instagramUrl}
                    aria-label={`${member.name} Instagram`}
                    className="transition-colors hover:text-indigo-700"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                ) : null}
                {member.linkedinUrl ? (
                  <a
                    href={member.linkedinUrl}
                    aria-label={`${member.name} LinkedIn`}
                    className="transition-colors hover:text-indigo-700"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}