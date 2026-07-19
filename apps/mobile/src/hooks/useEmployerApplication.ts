import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { getEmployerApplicationById } from '../api/application';
import {
  ApplicantDetail,
  mapStatusToHiringStage,
} from '../app/pages/employer/all-applications/data';
import { ApplicationStatus } from '../types/application';

const SINGLE_KEY = (id: string | number) =>
  ['employer-application', id] as const;
const LIST_KEY = ['employer-applications'] as const;

type RawApplication = {
  id: number | string;
  candidateId?: string;
  status: ApplicationStatus;
  createdAt: string;
  jobId: number;
  job?: {
    title?: string;
    type?: string;
    category?: ApplicantDetail['jobCategory'];
  };
  resume?: { fileKey?: string };
  matchPercentage?: number | null;
  candidate?: {
    name?: string | null;
    email?: string;
    phone?: string;
    avatarUrl?: string | null;
  };
};

function toApplicantDetail(raw: RawApplication): ApplicantDetail {
  const candidateId = raw.candidateId ?? String(raw.id);
  const candidateName =
    raw.candidate?.name?.trim() ||
    raw.candidate?.email ||
    `Candidate ${candidateId}`;
  const appliedRole = raw.job?.title ?? 'Unknown role';

  return {
    id: String(raw.id),
    applicantId: candidateId,
    name: candidateName,
    image: raw.candidate?.avatarUrl ?? null,
    email: raw.candidate?.email || '',
    phone: raw.candidate?.phone || '',
    title: appliedRole,
    jobListingId: String(raw.jobId ?? raw.id),
    appliedRole,
    jobCategory:
      raw.job?.category ??
      ({
        id: 0,
        name: 'General',
        slug: 'general',
      } as ApplicantDetail['jobCategory']),
    employmentType:
      (raw.job?.type as ApplicantDetail['employmentType']) ?? 'FULL_TIME',
    appliedDate: raw.createdAt.split('T')[0],
    resume: raw.resume?.fileKey || '',
    score: raw.matchPercentage ?? null,
    hiringStage: mapStatusToHiringStage(raw.status),
  };
}

function readFromListCache(
  queryClient: QueryClient,
  id: string | number
): ApplicantDetail | null {
  const queries = queryClient.getQueriesData<{
    pages: { applications: RawApplication[] }[];
  }>({
    queryKey: LIST_KEY,
  });
  for (const [, cached] of queries) {
    if (!cached?.pages) continue;
    for (const page of cached.pages) {
      const hit = page.applications.find((a) => String(a.id) === String(id));
      if (hit) return toApplicantDetail(hit);
    }
  }
  return null;
}

export function useEmployerApplication(id: string | number) {
  const queryClient = useQueryClient();

  const query = useQuery<ApplicantDetail, Error>({
    queryKey: SINGLE_KEY(id),
    queryFn: async () => {
      const raw = (await getEmployerApplicationById(id)) as RawApplication;
      return toApplicantDetail(raw);
    },
    initialData: () => readFromListCache(queryClient, id) ?? undefined,
    staleTime: 30 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
