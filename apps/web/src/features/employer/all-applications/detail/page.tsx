'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ApplicantOverview from '@/components/employer/applicantOverview';
import ApplicantDetails from '@/components/employer/applicantDetails';
import { CandidateProfileProvider } from '@/api-hook/candidate/CandidateProfileContext';
import { useEmployerApplication } from '@/api-hook/application';

function ApplicantDetailPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: applicant,
    isLoading,
    isError,
    error,
    refetch,
  } = useEmployerApplication(id);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 border-b border-[#d6ddeb]">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="p-1"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[var(--text-secondary)] text-sm sm:text-base">
            Loading application details...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !applicant) {
    const message =
      error instanceof Error ? error.message : 'Application not found';
    return (
      <div className="w-full min-h-screen flex flex-col">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 border-b border-[#d6ddeb] flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="p-1"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-3 sm:px-4 md:px-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6 max-w-md w-full">
            <h2 className="text-base sm:text-lg font-semibold text-red-900">
              {message}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-red-700">
              {error
                ? 'Please try again or go back to the applications list.'
                : 'The application you are looking for does not exist.'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-3 py-1.5 rounded-md border border-red-300 text-xs sm:text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <div className="sticky top-0 z-10 border-b border-[#d6ddeb] bg-white">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex items-center gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--text-primary)]" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] truncate">
            {applicant.name}
          </h1>
        </div>
      </div>

      <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
          <ApplicantOverview applicant={applicant} />
          <ApplicantDetails applicant={applicant} />
        </div>
      </div>
    </div>
  );
}

export default function ApplicantDetailPage() {
  return (
    <CandidateProfileProvider>
      <ApplicantDetailPageContent />
    </CandidateProfileProvider>
  );
}
