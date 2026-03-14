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
    if (!Number.isFinite(appliedCount) || !Number.isFinite(capacity)) {
      return '0%';
    }

    if (capacity <= 0) return '0%';

    const percent = (appliedCount / capacity) * 100;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const roundedPercent = Number(clampedPercent.toFixed(2));

    return `${roundedPercent}%`;
  },

  formatSalary(salary: JobSalary): string {
    const min = Number.isFinite(salary.min) ? salary.min : 0;
    const max = Number.isFinite(salary.max) ? salary.max : 0;
    const rangeMin = Math.min(min, max);
    const rangeMax = Math.max(min, max);

    try {
      const currencyFormatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: salary.currency,
        maximumFractionDigits: 0,
      });

      return `${currencyFormatter.format(rangeMin)}-${currencyFormatter.format(
        rangeMax
      )}`;
    } catch {
      const numberFormatter = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 0,
      });

      return `${numberFormatter.format(rangeMin)}-${numberFormatter.format(
        rangeMax
      )} ${salary.currency}`;
    }
  },
};
