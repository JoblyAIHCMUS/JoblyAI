'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import ApplicantOverview from '@/components/employer/applicantOverview';
import ApplicantDetails from '@/components/employer/applicantDetails';
import { CandidateProfileProvider } from '@/api-hook/candidate/CandidateProfileContext';
import { type HiringStage } from '@/features/employer/hiringStage';
import { type ApplicantDetail } from './data';
import { listEmployerApplications } from '@/api-client/application/employer';
import { toast } from 'sonner';

// Simply use the category slug directly - supports all categories, not just hardcoded ones
function getCategorySlug(slug: string): string {
  return slug;
}

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
        const employmentType = (application.job.type || 'FULL_TIME') as
          | 'FULL_TIME'
          | 'PART_TIME'
          | 'CONTRACT'
          | 'INTERNSHIP'
          | 'FREELANCE';

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
          jobCategory: getCategorySlug(application.job.category.slug),
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="h-7 w-7" />
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--text-secondary)]">
            Loading application details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="h-7 w-7" />
          </button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-lg font-semibold text-red-900">
            {error || 'Application not found'}
          </h2>
          <p className="mt-2 text-sm text-red-700">
            {error
              ? 'Please try again or go back to the applications list.'
              : 'The application you are looking for does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h1 className="text-3xl font-bold">{applicant.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <ApplicantOverview applicant={{ ...applicant, hiringStage }} />
        <ApplicantDetails
          applicant={{ ...applicant, hiringStage }}
          hiringStage={hiringStage}
          setHiringStage={setHiringStage}
        />
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
