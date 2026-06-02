import BrowseCompaniesCompanyProfilePage from '@/features/browse-companies/company-profile/page';

export default async function BrowseCompaniesCompanyDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BrowseCompaniesCompanyProfilePage companyId={id} />;
}
