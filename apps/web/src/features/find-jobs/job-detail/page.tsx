'use client';
import JobDetailHeader from '@/components/job-detail/JobDetailHeader';
import JobDetailContent from '@/components/job-detail/JobDetailContent';
import JobCompanySection from '@/components/job-detail/JobCompanySection';
import JobDetailSimilarJobs from '@/components/job-detail/JobDetailSimilarJobs';
import { useJobDetail } from '@/hooks/useJobDetail';

export default function JobDetailPage() {
  const {
    jobId,
    breadcrumbItems,
    jobName,
    company,
    address,
    workType,
    companyDescription,
    companyPhotos,
    companyPageUrl,
  } = useJobDetail();

  return (
    <div className="w-full bg-white">
      <JobDetailHeader
        breadcrumbItems={breadcrumbItems}
        jobTitle={jobName}
        company={company}
        address={address}
        workType={workType}
        jobId={jobId}
      />
      <JobDetailContent />
      <JobCompanySection
        company={company}
        description={companyDescription}
        photos={companyPhotos}
        companyUrl={companyPageUrl}
      />
      <JobDetailSimilarJobs />
    </div>
  );
}
