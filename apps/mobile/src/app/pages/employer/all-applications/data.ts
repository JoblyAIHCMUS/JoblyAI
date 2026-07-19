import {
  ApplicationStatus,
  PaginatedApplicationsResponse,
} from '../../../../types/application';
import { AllApplication, HiringStage } from './types';
import { JobCategory, EmploymentType } from '../../../../types/job';

/**
 * Map backend ApplicationStatus to frontend HiringStage.
 * Mirrors apps/web/src/api-client/application/mappers.ts::mapApplicationStatusToHiringStage.
 */
export function mapStatusToHiringStage(status: ApplicationStatus): HiringStage {
  const statusMap: Record<ApplicationStatus, HiringStage> = {
    APPLIED: 'Applied',
    PRE_SHORTLIST_PENDING: 'Applied',
    PRE_SHORTLIST_SUBMITTED: 'Applied',
    INTERVIEW: 'Interview',
    OFFER: 'Offer',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
  };
  return statusMap[status];
}

/**
 * Tailwind class strings for each hiring stage.
 * Mirrors the web's hiringStageStyles but uses the mobile's existing tokens.
 */
export const hiringStageStyles: Record<HiringStage, string> = {
  Applied: 'border-app-secondary-2 text-app-secondary-2',
  Interview: 'border-app-amber-2 text-app-amber-2',
  Offer: 'border-app-emerald-2 text-app-emerald-2',
  Rejected: 'border-app-red-1 text-app-red-1',
  Withdrawn: 'border-app-gray-3 text-app-gray-3',
};

/**
 * Forward-only stage transitions — mirrors the web's nextStageMap.
 */
export const nextStageMap: Partial<Record<HiringStage, HiringStage>> = {
  Applied: 'Interview',
  Interview: 'Offer',
};

/**
 * Progress percentage for the stage progress bar in the applicant detail
 * overview. Mirrors apps/web/src/features/employer/all-applications/detail/data.ts.
 */
export const hiringStageProgress: Record<HiringStage, number> = {
  Applied: 20,
  Interview: 40,
  Offer: 80,
  Rejected: 0,
  Withdrawn: 0,
};

/**
 * Background-color class for the filled portion of the stage progress bar.
 * Uses existing mobile tokens (no new colors needed).
 */
export const hiringStageColor: Record<HiringStage, string> = {
  Applied: 'bg-app-secondary-2',
  Interview: 'bg-app-amber-2',
  Offer: 'bg-app-emerald-2',
  Rejected: 'bg-app-red-1',
  Withdrawn: 'bg-app-gray-3',
};

/**
 * Full applicant record shown on the detail screen. Mirrors
 * apps/web/src/features/employer/all-applications/detail/data.ts::ApplicantDetail.
 */
export interface ApplicantDetail {
  id: string;
  applicantId: string;
  name: string;
  image: string | null;
  email: string;
  phone: string;
  title: string;
  jobListingId: string;
  appliedRole: string;
  jobCategory: JobCategory;
  employmentType: EmploymentType;
  appliedDate: string;
  resume: string;
  score: number | null;
  hiringStage: HiringStage;
}

/**
 * Convert a paginated API response into UI-ready AllApplication rows.
 * The backend's ApplicationRecord includes a `job` and optional `candidate`
 * object that the mobile's typed `ApplicationRecord` doesn't expose; we
 * safely access them via a narrow cast (same pattern used in
 * apps/mobile/src/app/pages/employer/jobs/[id].tsx).
 */
export function mapApiResponseToApplications(
  applications: PaginatedApplicationsResponse['applications']
): AllApplication[] {
  return applications.map((app) => {
    const enriched =
      app as PaginatedApplicationsResponse['applications'][number] & {
        candidateId?: string;
        job?: { title?: string };
        candidate?: { name?: string | null; email?: string; avatarUrl?: string | null };
        matchPercentage?: number | null;
        matchExplanation?: { overallScore?: number | null } | null;
      };

    const displayName =
      enriched.candidate?.name?.trim() ||
      enriched.candidate?.email ||
      `Candidate ${enriched.candidateId ?? app.id}`;

    return {
      id: String(app.id),
      applicantId: enriched.candidateId ?? String(app.id),
      name: displayName,
      image: enriched.candidate?.avatarUrl ?? null,
      appliedDate: app.createdAt.split('T')[0],
      score:
        enriched.matchExplanation?.overallScore ??
        enriched.matchPercentage ??
        null,
      hiringStage: mapStatusToHiringStage(app.status),
      appliedRole: enriched.job?.title ?? 'Unknown role',
    };
  });
}
