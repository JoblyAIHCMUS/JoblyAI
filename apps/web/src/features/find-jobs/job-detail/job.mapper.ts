import type { JobDetailContentProps } from '@/types/jobDetail';
import type { JobPosting } from '@/types/job';
import {
  parseDescription,
  calculateApplicationProgress,
  formatSalary,
  getCategoryColor,
  formatJobType,
  formatDate,
} from './job.utils';

/**
 * Maps a JobPosting from the API to JobDetailContentProps for the UI.
 * Handles all data transformation including parsing, formatting, and validation.
 *
 * This is the clean architecture boundary:
 * - Input: API response (JobPosting)
 * - Output: View model (JobDetailContentProps)
 * - Side effects: None (pure function)
 */
export function mapJobPostingToDetailContent(
  job: JobPosting,
  appliedCount = 0,
  capacity = 1 // Default to 1 to avoid division by zero in progress calculation
): JobDetailContentProps {
  const descriptionContent = parseDescription(job.description);
  const applicationProgress = calculateApplicationProgress(
    appliedCount,
    capacity
  );
  const formattedSalary = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.currency
  );
  const categoryColor = getCategoryColor(job.category.name);
  const jobType = formatJobType(job.type);
  const applyBefore = formatDate(job.updatedAt);
  const postedOn = formatDate(job.createdAt);

  return {
    descriptionContent,
    aboutRole: {
      appliedCount,
      capacity,
      applyBefore,
      postedOn,
      jobType,
      salary: {
        min: job.salaryMin ?? 0,
        max: job.salaryMax ?? 0,
        currency: job.currency ?? 'USD',
      },
    },
    category: {
      label: job.category.name,
      color: categoryColor,
    },
    requiredSkills: (job.requirements || []).map((req) => ({
      skillName: req.skillName,
      importance: req.importance,
      minYearsExperience: req.minYearsExperience,
    })),
    applicationProgress,
    formattedSalary,
  };
}
