export type HiringStage =
  | 'Applied'
  | 'Interview'
  | 'Offered'
  | 'Rejected'
  | 'Withdrawn';

export const hiringStageStyles: Record<HiringStage, string> = {
  Applied: 'border-blue-500 text-blue-600 bg-transparent hover:bg-blue-50',
  Interview: 'border-amber-500 text-amber-600 bg-transparent hover:bg-amber-50',
  Offered: 'border-green-500 text-green-600 bg-transparent hover:bg-green-50',
  Rejected: 'border-red-500 text-red-600 bg-transparent hover:bg-red-50',
  Withdrawn: 'border-gray-500 text-gray-600 bg-transparent hover:bg-gray-50',
};

export const nextStageMap: Partial<Record<HiringStage, HiringStage>> = {
  Applied: 'Interview',
  Interview: 'Offered',
};

export const hiringStageOrder: Record<HiringStage, number> = {
  Applied: 0,
  Interview: 1,
  Offered: 2,
  Rejected: 3,
  Withdrawn: 4,
};
