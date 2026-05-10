import { ApplicationStatus } from '@/types/candidate';

export function isActiveApplicationStatus(status: ApplicationStatus) {
  return (
    status === 'applied' || status === 'viewed' || status === 'interviewing'
  );
}

export function isClosedApplicationStatus(status: ApplicationStatus) {
  return status === 'offered' || status === 'rejected';
}
