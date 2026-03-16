import CompanyCard from '@/components/browse-companies/recommended/CompanyCard';
import { recommendedCompanyService } from '@/services/recommendedCompanyService';

export default function RecommendedCompaniesSection() {
  const companies = recommendedCompanyService.getRecommendedCompanies();

  return (
    <section className="bg-white px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold leading-[38px] tracking-[-0.2px] text-slate-900 md:text-[32px]">
            Recommended Companies
          </h2>
          <p className="mt-2 text-base leading-[1.6] text-slate-600">
            Based on your profile, company preferences, and recent activity
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
}
