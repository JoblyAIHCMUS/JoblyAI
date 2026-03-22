import { notFound } from 'next/navigation';
import CompanyDetailHero from '@/components/company-profile/CompanyDetailHero';
import CompanyOverviewSection from '@/components/company-profile/CompanyOverviewSection';
import CompanyTeamSection from '@/components/company-profile/CompanyTeamSection';
import JobDetailSimilarJobs from '@/components/job-detail/JobDetailSimilarJobs';
import { companyProfileService } from '@/services/companyProfileService';

export default function BrowseCompaniesCompanyProfilePage({
  companyId,
}: {
  companyId: string;
}) {
  const company = companyProfileService.getCompanyProfile(companyId);

  if (!company) {
    notFound();
  }

  return (
    <div className="w-full bg-white">
      <CompanyDetailHero company={company} />
      <CompanyOverviewSection company={company} />
      <CompanyTeamSection company={company} />
      <JobDetailSimilarJobs title="Open Jobs" jobs={company.openJobs} />
    </div>
  );
}
