// apps/web/src/features/candidate/pre-shortlist/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCandidatePreShortlist } from '@/api-hook/pre-shortlist';
import { usePageTitle } from '@/contexts/page-title-context';
import { PreShortlistSkeleton } from './components/PreShortlistSkeleton';
import { PreShortlistForm } from './components/PreShortlistForm';

interface PreShortlistPageProps {
  applicationId: string;
}

export default function PreShortlistPage({
  applicationId,
}: PreShortlistPageProps) {
  const router = useRouter();
  const { setTitle } = usePageTitle();
  const id = Number(applicationId);
  const { data, isLoading, isError, error } = useCandidatePreShortlist(id);

  useEffect(() => {
    setTitle('Pre-shortlist questions');
  }, [setTitle]);

  useEffect(() => {
    // If the user lands here but is not eligible (already past the form, or
    // the job has no questions), redirect them to the applications list.
    if (!data) return;
    if (
      data.status === 'INTERVIEW' ||
      data.status === 'OFFER' ||
      data.status === 'REJECTED' ||
      data.status === 'WITHDRAWN'
    ) {
      router.replace('/candidate/applications');
      return;
    }
    if (data.questions.length === 0) {
      router.replace('/candidate/applications');
    }
  }, [data, router]);

  if (isLoading) return <PreShortlistSkeleton />;

  if (isError || !data) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-0 py-8">
        <h1 className="text-xl font-semibold text-slate-900">
          Could not load pre-shortlist questions
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          {error instanceof Error ? error.message : 'Please try again later.'}
        </p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-3 py-1.5 rounded-md border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <PreShortlistForm
      applicationId={id}
      jobId={0}
      data={data}
      readOnly={data.status === 'PRE_SHORTLIST_SUBMITTED'}
    />
  );
}
