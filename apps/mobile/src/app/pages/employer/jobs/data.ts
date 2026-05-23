import { JobPosting, JobStatus as BackendJobStatus } from '../../../../types/job';

export type JobStatus = 'Live' | 'Closed' | 'Draft';
export type JobType = 'Fulltime' | 'Freelance' | 'Part-time';

export interface JobListing {
  id: string;
  originalId: number; // Keep track of the number ID for mutations
  title: string;
  datePosted: string;
  applicants: number;
  needsFilled: number;
  needsTotal: number;
  status: JobStatus;
  type: JobType;
}

export function mapJobPostingToListing(job: JobPosting): JobListing {
  const statusMap: Record<BackendJobStatus, JobStatus> = {
    OPEN: 'Live',
    DRAFT: 'Draft',
    CLOSED: 'Closed',
  };

  // Safe fallback for formatting dates
  let formattedDate = 'Unknown Date';
  if (job.createdAt) {
    try {
      const d = new Date(job.createdAt);
      formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      formattedDate = String(job.createdAt).split('T')[0];
    }
  }

  // Map EmploymentType to frontend JobType (Simplified map, adjust as needed)
  let type: JobType = 'Fulltime';
  if (job.type === 'PART_TIME') type = 'Part-time';
  else if (job.type === 'FREELANCE' || job.type === 'CONTRACT') type = 'Freelance';

  return {
    id: String(job.id),
    originalId: job.id,
    title: job.title,
    datePosted: formattedDate,
    applicants: 0, // Mocked for now until applicant count is added to backend response
    needsFilled: 0,
    needsTotal: 0,
    status: statusMap[job.status] || 'Draft',
    type,
  };
}
