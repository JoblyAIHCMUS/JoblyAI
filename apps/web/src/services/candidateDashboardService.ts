import {
  CANDIDATE_DASHBOARD_APPLICATIONS,
  CANDIDATE_DASHBOARD_FILTER_META,
  CANDIDATE_DASHBOARD_STATUS_META,
} from '@/mocks/candidateDashboard';
import { ApplicationItem } from '@/features/candidate/dashboard/types';

function parseAppliedDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const candidateDashboardService = {
  getApplications() {
    return CANDIDATE_DASHBOARD_APPLICATIONS;
  },
  getStatusMeta() {
    return CANDIDATE_DASHBOARD_STATUS_META;
  },
  getFilterMeta() {
    return CANDIDATE_DASHBOARD_FILTER_META;
  },
  filterApplicationsByDate(
    items: ApplicationItem[],
    startDate?: string,
    endDate?: string
  ) {
    if (!startDate && !endDate) {
      return items;
    }

    return items.filter((item) => {
      const appliedDate = parseAppliedDate(item.appliedDate);
      if (!appliedDate) {
        return true;
      }

      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (appliedDate < start) {
          return false;
        }
      }

      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`);
        if (appliedDate > end) {
          return false;
        }
      }

      return true;
    });
  },
};
