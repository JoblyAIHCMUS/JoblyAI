export type HiringStage =
  | 'In Review'
  | 'Shortlisted'
  | 'Interviewed'
  | 'Hired'
  | 'Declined';

export const hiringStageStyles: Record<HiringStage, string> = {
  'In Review': 'border-blue-500 text-blue-600 bg-transparent hover:bg-blue-50',
  Shortlisted:
    'border-amber-500 text-amber-600 bg-transparent hover:bg-amber-50',
  Interviewed:
    'border-purple-500 text-purple-600 bg-transparent hover:bg-purple-50',
  Hired: 'border-green-500 text-green-600 bg-transparent hover:bg-green-50',
  Declined: 'border-red-500 text-red-600 bg-transparent hover:bg-red-50',
};

export const nextStageMap: Partial<Record<HiringStage, HiringStage>> = {
  'In Review': 'Shortlisted',
  Shortlisted: 'Interviewed',
  Interviewed: 'Hired',
};

export const hiringStageOrder: Record<HiringStage, number> = {
  'In Review': 0,
  Shortlisted: 1,
  Interviewed: 2,
  Hired: 3,
  Declined: 4,
};
