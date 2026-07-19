import { type HiringStage } from '@/features/employer/hiringStage';

export interface AllApplication {
  id: string;
  applicantId: string;
  name: string;
  image: string | null;
  appliedDate: string;
  score: number;
  hiringStage: HiringStage;
  appliedRole: string;
}
