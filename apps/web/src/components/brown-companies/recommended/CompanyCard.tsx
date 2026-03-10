import type { RecommendedCompany } from '@/types/recommendedCompany';
import CategoryBadge from './CategoryBadge';
import CompanyLogo from './CompanyLogo';

export default function CompanyCard({ company }: { company: RecommendedCompany }) {
  return (
    <article className="rounded-[10px] border border-slate-300 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <CompanyLogo company={company} />
        <span className="inline-flex rounded-sm bg-indigo-50 px-3 py-1 text-base font-normal leading-[22px] tracking-[-0.18px] text-indigo-700">
          {company.jobs}
        </span>
      </div>

      <h3 className="mb-4 text-3xl font-semibold leading-[30px] tracking-[-0.15px] text-slate-900">
        {company.name}
      </h3>

      <p className="mb-4 min-h-[96px] text-base leading-6 text-slate-600">{company.description}</p>

      <div className="flex flex-wrap items-center gap-3">
        {company.tags.map((tag) => (
          <CategoryBadge key={`${company.name}-${tag.label}`} tag={tag} />
        ))}
      </div>
    </article>
  );
}
