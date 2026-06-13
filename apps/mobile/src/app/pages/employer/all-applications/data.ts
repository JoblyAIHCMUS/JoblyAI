import { ApplicationStatus, PaginatedApplicationsResponse } from '../../../../types/application';
import { AllApplication, HiringStage } from './types';

/**
 * Map backend ApplicationStatus to frontend HiringStage.
 * Mirrors apps/web/src/api-client/application/mappers.ts::mapApplicationStatusToHiringStage.
 */
export function mapStatusToHiringStage(status: ApplicationStatus): HiringStage {
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
    const enriched = app as PaginatedApplicationsResponse['applications'][number] & {
      candidateId?: string;
      job?: { title?: string };
      candidate?: { name?: string | null; email?: string };
      matchPercentage?: number | null;
    };

    const displayName =
      enriched.candidate?.name?.trim() ||
      enriched.candidate?.email ||
      `Candidate ${enriched.candidateId ?? app.id}`;

    return {
      id: String(app.id),
      applicantId: enriched.candidateId ?? String(app.id),
      name: displayName,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        enriched.candidateId ?? String(app.id)
      )}`,
      appliedDate: app.createdAt.split('T')[0],
      score: enriched.matchPercentage ?? null,
      hiringStage: mapStatusToHiringStage(app.status),
      appliedRole: enriched.job?.title ?? 'Unknown role',
    };
  });
}
