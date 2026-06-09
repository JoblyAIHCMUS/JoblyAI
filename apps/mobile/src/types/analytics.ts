export interface JobViewAnalytics {
  period: string;
  jobId: number;
  viewCount: number;
}

export interface JobApplicationAnalytics {
  period: string;
  applicationCount: number;
  approvedCount: number;
}

export interface JobViewsAnalyticsResponse {
  totalViews: number;
  series: { period: string; viewCount: number }[];
}
