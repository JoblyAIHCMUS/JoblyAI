import { useMemo } from 'react';
import { jobDetailService } from '@/services/jobDetailService';

export function useJobDetail() {
  const jobDetail = jobDetailService.getJobDetail();
  const pageData = jobDetailService.getJobDetailPageData();

  const descriptionContent = useMemo(
    () => jobDetailService.parseDescription(jobDetail.description),
    [jobDetail.description]
  );

  const applicationProgress = jobDetailService.getApplicationProgress(
    jobDetail.aboutRole.appliedCount,
    jobDetail.aboutRole.capacity
  );
  const formattedSalary = jobDetailService.formatSalary(jobDetail.aboutRole.salary);

  return {
    jobDetail,
    descriptionContent,
    applicationProgress,
    formattedSalary,
    ...pageData,
  };
}
