import {
  ApplicationStatus,
  ApplicationFilterMeta,
  ApplicationStatusMeta,
} from '@/types/candidate';

export const CANDIDATE_DASHBOARD_STATUS_META: ApplicationStatusMeta = {
  applied: {
    label: 'Applied',
    className: 'border-[#7c8493] text-[#7c8493]',
  },
  viewed: {
    label: 'Viewed',
    className: 'border-[#1fb5e9] text-[#1fb5e9]',
  },
  interviewing: {
    label: 'Interviewing',
    className: 'border-[#4640de] text-[#4640de]',
  },
  offered: {
    label: 'Offered',
    className: 'border-[#00a36c] text-[#00a36c]',
  },
  rejected: {
    label: 'Rejected',
    className: 'border-[#ff6550] text-[#ff6550]',
  },
};

export const CANDIDATE_DASHBOARD_FILTER_META: ApplicationFilterMeta = {
  all: { label: 'All' },
  active: { label: 'Active' },
  closed: { label: 'Closed' },
};

export function isActiveApplicationStatus(status: ApplicationStatus) {
  return (
    status === 'applied' || status === 'viewed' || status === 'interviewing'
  );
}

export function isClosedApplicationStatus(status: ApplicationStatus) {
  return status === 'offered' || status === 'rejected';
}
