'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { renderDescription } from '@/lib/utils';
import { useRole } from '@/contexts/role-context';
import { usePageTitle } from '@/contexts/page-title-context';
import JobDetailHeader from '@/components/job-detail/JobDetailHeader';
import JobDetailContent from '@/components/job-detail/JobDetailContent';
import JobCompanySection from '@/components/job-detail/JobCompanySection';
import JobDetailSimilarJobs from '@/components/job-detail/JobDetailSimilarJobs';
import { useJobDetail } from '@/api-hook/jobs/useJobDetail';
import { useListCandidateApplications } from '@/api-hook/application';
import { useUser } from '@/hooks/useUser';
import { mapJobPostingToDetailContent } from '@/features/find-jobs/job-detail/job.mapper';
import type { JobPosting } from '@/api-client/jobs';
import type { JobDetailContentProps } from '@/types/jobDetail';
import type { ApplicationRecord } from '@/api-client/application';

interface PageData {
  jobId: number;
  breadcrumbItems: { label: string; href?: string }[];
  jobName: string;
  company: JobPosting['company'];
  address: string;
  workType: string;
  companyDescription: string;
  companyPhotos: string[];
  companyPageUrl: string;
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id;
  const role = useRole();
  const { setTitle } = usePageTitle();

  // Role-aware navigation link
  const findJobsHref =
    role === 'candidate' ? '/candidate/find-jobs' : '/find-jobs';

  const { fetchJobDetail } = useJobDetail();
  const { fetchApplications } = useListCandidateApplications();
  const { data: user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [jobDetailProps, setJobDetailProps] =
    useState<JobDetailContentProps | null>(null);
  const [jobData, setJobData] = useState<JobPosting | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [appsList, setAppsList] = useState<ApplicationRecord[]>([]);

  useEffect(() => {
    setTitle('Job Description');
  }, [setTitle]);

  useEffect(() => {
    if (!jobId) {
      setError('Job ID not found');
      setLoading(false);
      return;
    }

    const loadJobDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch job data using the hook
        const jobData = await fetchJobDetail(Number(jobId));

        // TODO: Replace with job-specific API: GET /api/jobs/{jobId}/applications/count
        // Analytics API is employer-specific and returns cross-job aggregates
        // Not suitable for public job detail page
        const totalApplied = 0;

        // breadcrumbItems use the role-aware findJobsHref defined at component level

        // Transform JobPosting into PageData structure
        const transformedData: PageData = {
          jobId: jobData.id,
          breadcrumbItems: [
            { label: 'Find Jobs', href: findJobsHref },
            { label: jobData.title },
          ],
          jobName: jobData.title,
          company: jobData.company,
          address: jobData.location || 'Remote',
          workType: jobData.type,
          companyDescription: renderDescription(jobData.company.description || ''),
          companyPhotos: jobData.company.logoUrl
            ? [jobData.company.logoUrl]
            : [],
          companyPageUrl: `/browse-companies/${jobData.company.id}`,
        };

        setPageData(transformedData);

        // Map JobPosting to JobDetailContentProps using the view model mapper
        // appliedCount now comes from the analytics API
        // TODO: capacity should come from a dedicated job posting endpoint
        const detailProps = mapJobPostingToDetailContent(jobData, totalApplied);
        setJobDetailProps(detailProps);
        setJobData(jobData);

        // If user is signed in and candidate, check if they've applied to this job
        try {
          if (user) {
            const apps = await fetchApplications({ page: 1, pageSize: 100 });
            const activeStatuses = ['APPLIED', 'INTERVIEW', 'OFFER'];
            const applied = (apps.applications || []).some(
              (a) => a.jobId === jobData.id && activeStatuses.includes(a.status)
            );
            setHasApplied(applied);
            setAppsList(apps.applications ?? []);
          } else {
            setHasApplied(false);
          }
        } catch (err) {
          // Ignore errors (e.g., unauthenticated) and assume not applied
          setHasApplied(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load job details';
        setError(errorMessage);
        console.error('Error fetching job detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJobDetail();
  }, [jobId, role, fetchJobDetail]);

  if (loading) {
    return (
      <div className="w-full bg-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData || !jobDetailProps) {
    return (
      <div className="w-full bg-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Error Loading Job
          </h1>
          <p className="text-slate-600 mb-4">
            {error || 'Job details could not be found'}
          </p>
          <Link
            href={findJobsHref}
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {(() => {
        const preShortlistEligible =
          jobData !== null &&
          jobData.preShortlistThreshold > 0 &&
          jobData.preShortlistQuestions.length > 0;
        const matchingApp = appsList.find((a) => a.jobId === pageData.jobId);
        const preShortlistState: 'NONE' | 'PENDING' | 'SUBMITTED' =
          matchingApp?.status === 'PRE_SHORTLIST_PENDING'
            ? 'PENDING'
            : matchingApp?.status === 'PRE_SHORTLIST_SUBMITTED'
            ? 'SUBMITTED'
            : 'NONE';
        return (
          <JobDetailHeader
            breadcrumbItems={pageData.breadcrumbItems}
            jobTitle={pageData.jobName}
            company={pageData.company}
            address={pageData.address}
            workType={pageData.workType}
            jobId={pageData.jobId}
            hasApplied={hasApplied}
            applicationId={matchingApp ? matchingApp.id : undefined}
            preShortlistEligible={preShortlistEligible}
            preShortlistState={preShortlistState}
          />
        );
      })()}
      <JobDetailContent {...jobDetailProps} />
      <JobCompanySection
        company={pageData.company}
        description={pageData.companyDescription}
        photos={pageData.companyPhotos}
        companyUrl={pageData.companyPageUrl}
      />
      <JobDetailSimilarJobs jobId={pageData.jobId} />
    </div>
  );
}
