'use client';

import CompanyDetailHero from '@/components/company-profile/CompanyDetailHero';
import CompanyOverviewSection from '@/components/company-profile/CompanyOverviewSection';
import CompanyTeamSection from '@/components/company-profile/CompanyTeamSection';
import JobDetailSimilarJobs from '@/components/job-detail/JobDetailSimilarJobs';
import { companyProfileService } from '../../../services/companyProfileService';
import { useEffect } from 'react';
import { useGetCompany } from '@/api-hook/company/useGetCompany';

export default function BrowseCompaniesCompanyProfilePage({
  companyId,
}: {
  companyId: string;
}) {
  const { fetchCompany, loading, error, data: company } = useGetCompany();

  useEffect(() => {
    void fetchCompany(Number(companyId));
  }, [companyId, fetchCompany]);

  const displayCompany = company
    ? companyProfileService.getCompanyProfile(company)
    : null;

  if (loading && !displayCompany) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center bg-white text-slate-600">
        Loading Company Profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center bg-white text-red-600">
        Failed to load Company Profile.
      </div>
    );
  }

  if (!displayCompany) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center bg-white text-slate-600">
        Company Profile not found.
      </div>
    );
  }

  const hasOverviewContent = !!(
    displayCompany.description ||
    (displayCompany.contacts && displayCompany.contacts.length > 0) ||
    (displayCompany.gallery && displayCompany.gallery.length > 0) ||
    displayCompany.officeSummary ||
    (displayCompany.officeLocations &&
      displayCompany.officeLocations.length > 0)
  );

  return (
    <div className="w-full bg-white">
      <CompanyDetailHero company={displayCompany} />
      {hasOverviewContent && (
        <CompanyOverviewSection company={displayCompany} />
      )}
      {displayCompany.team && displayCompany.team.length > 0 && (
        <CompanyTeamSection company={displayCompany} />
      )}
      <JobDetailSimilarJobs
        title="Open Jobs"
        companyId={Number(companyId)}
        limit={4}
      />
    </div>
  );
}
