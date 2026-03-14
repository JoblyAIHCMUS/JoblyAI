import { JOB_DETAIL_MOCK, JOB_DETAIL_PAGE_DATA_MOCK } from '@/mocks/jobDetail';
import type {
  JobDescriptionContent,
  JobDetail,
  JobDetailPageData,
  JobSalary,
} from '@/types/jobDetail';

const EMPTY_DESCRIPTION_CONTENT: JobDescriptionContent = {
  overview: '',
  responsibilities: [],
  whoYouAre: [],
  niceToHaves: [],
};

export const jobDetailService = {
  getJobDetail(): JobDetail {
    return JOB_DETAIL_MOCK;
  },

  getJobDetailPageData(): JobDetailPageData {
    return JOB_DETAIL_PAGE_DATA_MOCK;
  },

  parseDescription(description: string): JobDescriptionContent {
    try {
      const parsed = JSON.parse(description) as Partial<JobDescriptionContent>;
      return {
        overview: parsed.overview ?? EMPTY_DESCRIPTION_CONTENT.overview,
        responsibilities: Array.isArray(parsed.responsibilities)
          ? parsed.responsibilities
          : EMPTY_DESCRIPTION_CONTENT.responsibilities,
        whoYouAre: Array.isArray(parsed.whoYouAre)
          ? parsed.whoYouAre
          : EMPTY_DESCRIPTION_CONTENT.whoYouAre,
        niceToHaves: Array.isArray(parsed.niceToHaves)
          ? parsed.niceToHaves
          : EMPTY_DESCRIPTION_CONTENT.niceToHaves,
      };
    } catch {
      return EMPTY_DESCRIPTION_CONTENT;
    }
  },

  getApplicationProgress(appliedCount: number, capacity: number): string {
    if (capacity <= 0) return '0%';
    return `${(appliedCount / capacity) * 100}%`;
  },

  formatSalary(salary: JobSalary): string {
    return `$${Math.floor(salary.min / 1000)}k-$${Math.floor(salary.max / 1000)}k ${salary.currency}`;
  },
};
