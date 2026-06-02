export type ApplicationStatus =
  | 'IN_REVIEW'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED';

export type ApplicationTab = 'ALL' | ApplicationStatus;

export type DatePreset = 'LAST_7_DAYS' | 'TODAY' | 'LAST_30_DAYS';

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
  logoBackgroundClassName: string;
  logoTextClassName: string;
}export type ApplicationStatus =
  | 'IN_REVIEW'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED';

export type ApplicationTab = 'ALL' | ApplicationStatus;

export type DatePreset = 'LAST_7_DAYS' | 'TODAY' | 'LAST_30_DAYS';

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
  logoBackgroundClassName: string;
  logoTextClassName: string;
}