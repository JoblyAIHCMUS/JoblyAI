import {
  ApplicationItem,
  ApplicationStatus,
  ApplicationStatusMeta,
} from '@/types/candidate';

export type BarChartItem = {
  key: string;
  label: string;
  count: number;
};

export type BarChartData = {
  items: BarChartItem[];
  maxCount: number;
};

export type PieChartItem = {
  status: ApplicationStatus;
  label: string;
  color: string;
  count: number;
  percent: number;
};

export type PieChartData = {
  total: number;
  items: PieChartItem[];
};

export type ChartView = 'timeline' | 'status';

export type StatusChartsSectionProps = {
  barChartItems: BarChartData;
  pieChartItems: PieChartData;
  pieChartBackground: string;
};

export type DashboardInsightsParams = {
  filteredApplications: ApplicationItem[];
  selectedStartDate: string;
  selectedEndDate: string;
  statusMeta: ApplicationStatusMeta;
};

export type DashboardInsightsResult = {
  barChartItems: BarChartData;
  pieChartItems: PieChartData;
  pieChartBackground: string;
  interviewedCount: number;
};
