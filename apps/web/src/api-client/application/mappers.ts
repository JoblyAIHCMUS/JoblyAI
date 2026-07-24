import type {
  ApplicationRecord,
  ApplicationStatus,
} from '@/api-client/application/types';
import type { Applicant } from '@/features/employer/job-listing/detail/data';
import type { HiringStage } from '@/features/employer/hiringStage';
import { type ApplicantDetail } from '@/features/employer/all-applications/detail/data';
import { type EmploymentType } from '@/features/employer/job-listing/data';
import { computeDisplayName } from '@/api-client/application/displayName';

/**
 * Map backend ApplicationStatus to frontend HiringStage
 */
export function mapApplicationStatusToHiringStage(
  status: ApplicationStatus
): HiringStage {
  const statusMap: Record<ApplicationStatus, HiringStage> = {
    APPLIED: 'Applied',
    PRE_SHORTLIST_PENDING: 'Applied',
    PRE_SHORTLIST_SUBMITTED: 'Applied',
    INTERVIEW: 'Interview',
    OFFER: 'Offered',
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
    name: computeDisplayName(candidate) || candidate.email || 'Unknown Candidate',
    image: candidate.avatarUrl,
    appliedDate: application.createdAt.split('T')[0], // Format as YYYY-MM-DD
    score:
      application.matchExplanation?.overallScore ??
      application.matchPercentage ??
      0,
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

/**
 * Convert backend ApplicationRecord to the full UI shape used by the
 * detail page. Mirrors the mobile's buildApplicantDetail.
 */
export function mapApplicationRecordToApplicantDetail(
  application: ApplicationRecord
): ApplicantDetail {
  const candidateName =
    computeDisplayName(application.candidate ?? {}) ||
    application.candidate?.email ||
    `Candidate ${application.candidateId}`;

  return {
    id: String(application.id),
    applicantId: application.candidateId,
    name: candidateName,
    image: application.candidate?.avatarUrl ?? null,
    email: application.candidate?.email || '',
    phone: '',
    title: application.job.title,
    jobListingId: String(application.jobId),
    appliedRole: application.job.title,
    jobCategory: application.job.category,
    employmentType: (application.job.type || 'FULL_TIME') as EmploymentType,
    appliedDate: application.createdAt.split('T')[0],
    resume: application.resume.fileKey || '',
    score:
      application.matchExplanation?.overallScore ??
      application.matchPercentage ??
      0,
    hiringStage: mapApplicationStatusToHiringStage(application.status),
  };
}
