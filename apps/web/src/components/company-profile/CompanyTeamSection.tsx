import Link from 'next/link';
import type { CompanyProfile } from '@/types/companyProfile';

export default function CompanyTeamSection({
  company,
}: {
  company: CompanyProfile;
}) {
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
            {company.team.map((member) => (
              <Link
                key={member.id}
                id={`team-member-${member.id}`}
                href={`/browse-companies/${company.id}/team/${member.id}`}
                className="flex w-[240px] shrink-0 flex-col items-center gap-4 rounded-[5px] border border-slate-300 bg-white p-6 text-center transition-colors hover:border-indigo-400"
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
