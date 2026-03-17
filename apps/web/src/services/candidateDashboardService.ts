import {
  CANDIDATE_DASHBOARD_APPLICATIONS,
  CANDIDATE_DASHBOARD_FILTER_META,
  CANDIDATE_DASHBOARD_STATUS_META,
} from '@/mocks/candidateDashboard';

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
};
