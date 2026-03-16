import BrowseCompaniesCompanyProfilePage from '@/features/browse-companies/company-profile/page';

export default function BrowseCompaniesCompanyDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return <BrowseCompaniesCompanyProfilePage companyId={id} />;
}
