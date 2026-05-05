import BrowseCompaniesCompanyProfilePage from '@/features/browse-companies/company-profile/page';

export default async function BrowseCompaniesCompanyDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <BrowseCompaniesCompanyProfilePage companySlug={slug} />;
}