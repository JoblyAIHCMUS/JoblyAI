// Types
export type {
  EmploymentType,
  JobStatus,
  RequirementImportance,
  JobCategory,
  JobPosting,
  PopularJobCategory,
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
  getPopularJobCategories,
  getSimilarJobs,
} from '@/api-client/jobs/public';

// Employer endpoints (auth required)
export {
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  listEmployerJobs,
  listEmployerJobsByCompany,
  getEmployerJobById,
  getCategories,
} from '@/api-client/jobs/employer';

// Analytics endpoints (auth required)
export {
  getJobViewsAnalytics,
  getJobApplicationsAnalytics,
  getJobViewsAnalyticsForJob,
} from '@/api-client/jobs/analytics';

// Analytics types
export type { JobViewsAnalyticsResponse } from '@/api-client/jobs/analytics';
