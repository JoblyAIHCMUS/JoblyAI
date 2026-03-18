import {
  CANDIDATE_DASHBOARD_APPLICATIONS,
  CANDIDATE_DASHBOARD_FILTER_META,
  CANDIDATE_DASHBOARD_STATUS_META,
} from '@/mocks/candidateDashboard';
import {
  ApplicationItem,
  CandidateApplicationsSearchParams,
} from '@/types/candidate';
import {
  isActiveApplicationStatus,
  isClosedApplicationStatus,
} from '@/lib/candidateStatus';

// TODO(real-api): Replace '@/mocks/candidateDashboard' data with backend responses.
// TODO(real-api): Keep this service interface stable so UI/hook do not need to change.

function parseCreatedAt(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function containsValue(value: string, keyword?: string) {
  const normalizedKeyword = normalize(keyword);
  if (!normalizedKeyword) {
    return true;
  }

  return value.toLowerCase().includes(normalizedKeyword);
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
      const createdAt = parseCreatedAt(item.createdAt);
      if (!createdAt) {
        return false;
      }

      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (createdAt < start) {
          return false;
        }
      }

      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`);
        if (createdAt > end) {
          return false;
        }
      }

      return true;
    });
  },
  getUniqueFilterOptions(
    items: ApplicationItem[],
    field: 'company' | 'jobType' | 'location'
  ) {
    return Array.from(new Set(items.map((item) => item[field]))).sort((a, b) =>
      a.localeCompare(b)
    );
  },
  async searchApplicationsApi(params: CandidateApplicationsSearchParams) {
    // TODO(real-api): Remove fake delay when wiring to real endpoint.
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    const {
      query,
      status = 'all',
      startDate,
      endDate,
      company,
      jobType,
      location,
    } = params;

    const normalizedQuery = normalize(query);
    const applications = this.getApplications();
    const statusFiltered = applications.filter((item) => {
      if (status === 'all') {
        return true;
      }

      if (status === 'active') {
        return isActiveApplicationStatus(item.status);
      }

      return isClosedApplicationStatus(item.status);
    });

    const dateFiltered = this.filterApplicationsByDate(
      statusFiltered,
      startDate,
      endDate
    );

    return dateFiltered.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        containsValue(item.title, normalizedQuery) ||
        containsValue(item.company, normalizedQuery) ||
        containsValue(item.location, normalizedQuery) ||
        containsValue(item.jobType, normalizedQuery);

      if (!matchesQuery) {
        return false;
      }

      if (!containsValue(item.company, company)) {
        return false;
      }

      if (!containsValue(item.jobType, jobType)) {
        return false;
      }

      if (!containsValue(item.location, location)) {
        return false;
      }

      return true;
    });
  },
  async searchApplications(params: CandidateApplicationsSearchParams) {
    // TODO(real-api): Point this method to the real API client (axios/fetch) and map response shape.
    return this.searchApplicationsApi(params);
  },
};
