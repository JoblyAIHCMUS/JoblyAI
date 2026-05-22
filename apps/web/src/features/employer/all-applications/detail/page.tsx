'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import ApplicantOverview from '@/components/employer/applicantOverview';
import ApplicantDetails from '@/components/employer/applicantDetails';
import { CandidateProfileProvider } from '@/api-hook/candidate/CandidateProfileContext';
import { type HiringStage } from '@/features/employer/hiringStage';
import { type ApplicantDetail } from './data';
import { type JobCategory, type EmploymentType } from '@/types/job';
import { listEmployerApplications } from '@/api-client/application/employer';
import { toast } from 'sonner';

function mapApplicationStatusToHiringStage(status: string): HiringStage {
  const statusMap: Record<string, HiringStage> = {
    APPLIED: 'Applied',
    INTERVIEW: 'Interview',
    OFFER: 'Offer',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
  };
  return statusMap[status] || 'Applied';
}

function ApplicantDetailPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiringStage, setHiringStage] = useState<HiringStage>('Applied');

  useEffect(() => {
    async function fetchApplication() {
      try {
        setLoading(true);
        setError(null);

        const applicationId = parseInt(id);
        if (isNaN(applicationId)) {
          setError('Invalid application ID');
          setLoading(false);
          return;
        }

        // Fetch all applications and find the one with matching ID
        // TODO: Once backend provides a GET /employers/applications/:id endpoint, use that instead
        const response = await listEmployerApplications({ pageSize: 100 });
        const application = response.applications.find(
          (app) => app.id === applicationId
        );

        if (!application) {
          setError('Application not found');
          setLoading(false);
          return;
        }

        // Transform API response to ApplicantDetail
        const candidateName =
          application.candidate?.name || 'Unknown Applicant';
        const employmentType = (application.job.type ||
          'FULL_TIME') as EmploymentType;

        const applicantData: ApplicantDetail = {
          id: application.id.toString(),
          applicantId: application.candidateId,
          name: candidateName,
          image:
            'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
            encodeURIComponent(candidateName),
          email: application.candidate?.email || '',
          phone: '', // Not available in API response
          title: application.job.title,
          jobListingId: application.jobId.toString(),
          appliedRole: application.job.title,
          jobCategory: application.job.category as JobCategory,
          employmentType: employmentType,
          appliedDate: new Date(application.createdAt)
            .toISOString()
            .split('T')[0],
          resume: application.resume.fileKey || '',
          score: application.matchPercentage || 0,
          hiringStage: mapApplicationStatusToHiringStage(application.status),
        };

        setApplicant(applicantData);
        setHiringStage(applicantData.hiringStage);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load application';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id]);

  if (loading) {
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

  if (error || !applicant) {
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
              {error || 'Application not found'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-red-700">
              {error
                ? 'Please try again or go back to the applications list.'
                : 'The application you are looking for does not exist.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Header with back button and title */}
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

      {/* Content area */}
      <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
          <ApplicantOverview applicant={{ ...applicant, hiringStage }} />
          <ApplicantDetails
            applicant={{ ...applicant, hiringStage }}
            hiringStage={hiringStage}
            setHiringStage={setHiringStage}
          />
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
