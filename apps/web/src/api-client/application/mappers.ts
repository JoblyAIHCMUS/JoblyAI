import type {
  ApplicationRecord,
  ApplicationStatus,
} from '@/api-client/application/types';
import type { Applicant } from '@/features/employer/job-listing/detail/data';
import type { HiringStage } from '@/features/employer/hiringStage';

/**
 * Map backend ApplicationStatus to frontend HiringStage
 */
export function mapApplicationStatusToHiringStage(
  status: ApplicationStatus
): HiringStage {
  const statusMap: Record<ApplicationStatus, HiringStage> = {
    APPLIED: 'Applied',
    INTERVIEW: 'Interview',
    OFFER: 'Offer',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
  };
  return statusMap[status];
}

/**
 * Convert backend ApplicationRecord to frontend Applicant
 */
export function mapApplicationRecordToApplicant(
  application: ApplicationRecord
): Applicant {
  const candidate = application.candidate || {
    id: application.candidateId,
    name: null,
    email: '',
    avatarUrl: null,
  };

  return {
    id: application.id.toString(),
    applicantId: application.candidateId,
    name: candidate.name || candidate.email || 'Unknown Candidate',
    image: candidate.avatarUrl || '',
    appliedDate: application.createdAt.split('T')[0], // Format as YYYY-MM-DD
    score: application.matchPercentage ?? 0,
    hiringStage: mapApplicationStatusToHiringStage(application.status),
  };
}

/**
 * Convert multiple ApplicationRecords to Applicants
 */
export function mapApplicationRecordsToApplicants(
  applications: ApplicationRecord[]
): Applicant[] {
  return applications.map(mapApplicationRecordToApplicant);
}
