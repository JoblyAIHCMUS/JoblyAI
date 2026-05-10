import { type HiringStage } from '@/features/employer/hiringStage';

export interface AllApplication {
  id: string;
  applicantId: string;
  name: string;
  image: string;
  appliedDate: string;
  score: number;
  hiringStage: HiringStage;
  appliedRole: string;
}
