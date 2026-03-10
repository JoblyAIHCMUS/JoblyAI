import type { CompanyCardData } from '@/types/company';
import CompanyLogo from './CompanyLogo';

export default function CompanyCard({ company }: { company: CompanyCardData }) {
  return (
    <article className="flex flex-col items-center gap-8 rounded-lg border border-slate-300 bg-white px-6 py-6">
      <CompanyLogo company={company} />

      <div className="flex flex-col items-center gap-4">
        <h3 className="text-center text-3xl font-semibold leading-8 tracking-tight text-slate-900">
          {company.name}
        </h3>

        <span className="inline-flex items-center justify-center rounded-sm bg-indigo-100 px-3 py-1 text-base font-normal leading-6 tracking-tight text-indigo-700">
          {company.openJobs} Jobs
        </span>
      </div>
    </article>
  );
}
