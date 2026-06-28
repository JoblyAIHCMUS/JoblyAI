import PreShortlistPage from '@/features/candidate/pre-shortlist/page';

export default async function CandidatePreShortlistRoute({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  return <PreShortlistPage applicationId={applicationId} />;
}
