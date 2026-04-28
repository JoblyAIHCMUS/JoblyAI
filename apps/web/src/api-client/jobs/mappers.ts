import type {
  JobPosting,
  JobStatus,
  JobRequirement,
} from '@/api-client/jobs/types';
import type {
  JobListingDetail,
  Category,
  SalaryCurrency,
} from '@/features/employer/job-listing/detail/data';
import type { SkillEntry } from '@/components/employer/skillTagsManager';
import type { JobListingStatus } from '@/features/employer/job-listing/data';

/**
 * Map backend JobStatus to frontend JobListingStatus
 */
function mapJobStatus(status: JobStatus): JobListingStatus {
  const statusMap: Record<JobStatus, JobListingStatus> = {
    DRAFT: 'Draft',
    OPEN: 'Live',
    CLOSED: 'Closed',
  };
  return statusMap[status] || 'Draft';
}

/**
 * Map backend salary currency string to frontend SalaryCurrency type
 */
function mapSalaryCurrency(currency: string | null): SalaryCurrency {
  if (!currency) return 'none';
  const currencyMap: Record<string, SalaryCurrency> = {
    USD: 'usd',
    EUR: 'eur',
    GBP: 'gbp',
    VND: 'vnd',
    JPY: 'jpy',
    CNY: 'cny',
  };
  return currencyMap[currency.toUpperCase()] || 'none';
}

/**
 * Map backend category slug to frontend Category type
 * Now accepts any category slug (no longer limited to hardcoded list)
 */
function mapCategorySlug(slug?: string): Category {
  // Simply return the slug directly - this allows any category from the backend
  // If slug is missing, default to empty string
  return slug || '';
}

/**
 * Transform backend requirements to frontend SkillEntry objects
 */
function mapRequirementsToEntries(
  requirements: JobRequirement[]
): SkillEntry[] {
  // Backend provides requirement objects with skill details
  // Map to SkillEntry using the actual importance from the requirement
  return (requirements || []).map((req) => ({
    name: req.skillName,
    importance: req.importance,
    minYearsExperience: req.minYearsExperience ?? undefined,
  }));
}

/**
 * Convert number to string, handling null values
 */
function formatSalary(value: number | null): string {
  if (value === null || value === undefined) return '';
  return value.toString();
}

/**
 * Format ISO date string to display format
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0]; // ISO format: YYYY-MM-DD
}

/**
 * Map backend JobPosting to frontend JobListingDetail
 * Handles all type conversions, enum mappings, and transformations
 */
export function mapJobPostingToListingDetail(
  jobPosting: JobPosting
): JobListingDetail {
  return {
    id: jobPosting.id.toString(),
    title: jobPosting.title,
    status: mapJobStatus(jobPosting.status),
    employmentType: jobPosting.type,
    remote: jobPosting.remote,
    location: jobPosting.location || undefined,
    category: mapCategorySlug(jobPosting.category?.slug),
    salaryCurrency: mapSalaryCurrency(jobPosting.currency),
    salaryMin: formatSalary(jobPosting.salaryMin),
    salaryMax: formatSalary(jobPosting.salaryMax),
    skills: mapRequirementsToEntries(jobPosting.requirements),
    datePosted: formatDate(jobPosting.createdAt),
    dateClosed: null, // Backend doesn't track closure date yet
    description: jobPosting.description,
    applicants: [], // Will be fetched separately in Phase 2
    monthlyViews: [], // Will be fetched from analytics endpoint in Phase 2
  };
}
