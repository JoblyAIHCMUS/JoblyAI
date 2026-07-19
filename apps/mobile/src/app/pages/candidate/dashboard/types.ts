export type ApplicationStatus =
  | 'APPLIED'
  | 'PRE_SHORTLIST_PENDING'
  | 'PRE_SHORTLIST_SUBMITTED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ApplicationTab = 'ALL' | ApplicationStatus;

export type DatePreset = 'LAST_7_DAYS' | 'TODAY' | 'LAST_30_DAYS' | 'ALL_TIME';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangeInput {
  from: string;
  to: string;
}

export interface ApplicationItem {
  id: string;
  title: string;
  company: string;
  location: string;
  appliedAt: Date;
  status: ApplicationStatus;
  logoUrl?: string;
}
