import { type HiringStage } from '@/features/employer/hiringStage';

export const hiringStageProgress: Record<HiringStage, number> = {
  Applied: 25,
  Interview: 50,
  Offer: 100,
  Rejected: 0,
  Withdrawn: 0,
};

export const hiringStageColor: Record<HiringStage, string> = {
  Applied: 'bg-blue-500',
  Interview: 'bg-amber-500',
  Offer: 'bg-green-500',
  Rejected: 'bg-red-500',
  Withdrawn: 'bg-gray-500',
};
