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
  JobViewAnalytics,
  JobApplicationAnalytics,
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
  listEmployerJobsByCompany,
  getCategories,
} from '@/api-client/jobs/employer';

// Analytics endpoints (auth required)
export {
  getJobViewsAnalytics,
  getJobApplicationsAnalytics,
} from '@/api-client/jobs/analytics';
