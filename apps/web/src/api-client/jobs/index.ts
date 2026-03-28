// Types
export type {
  EmploymentType,
  JobStatus,
  RequirementImportance,
  JobCategory,
  JobPosting,
  PaginatedJobsResponse,
  ListJobsQuery,
  JobRequirementInput,
  CreateJobPayload,
  UpdateJobPayload,
} from '@/api-client/jobs/types';

// Public endpoints (no auth required)
export {
  listJobs,
  getJobById,
  getJobsByCategory,
} from '@/api-client/jobs/public';

// Employer endpoints (auth required)
export {
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  listEmployerJobs,
  getCategories,
} from '@/api-client/jobs/employer';
