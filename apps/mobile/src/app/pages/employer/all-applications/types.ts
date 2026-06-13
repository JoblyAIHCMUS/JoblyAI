import { ApplicationStatus } from '../../../../types/application';

export type HiringStage =
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface AllApplication {
  id: string;
  applicantId: string;
  name: string;
  image: string;
  appliedDate: string;
  score: number | null;
  hiringStage: HiringStage;
  appliedRole: string;
}

export type { ApplicationStatus };
