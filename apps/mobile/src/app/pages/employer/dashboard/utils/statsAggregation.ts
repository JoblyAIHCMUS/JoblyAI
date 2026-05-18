import {
  JobViewAnalytics,
  JobApplicationAnalytics,
} from '../../../../../types/analytics';

export type StatsDataSet = {
  stacks: { value: number; color: string }[];
  label: string;
}[];

/**
 * Aggregates job views and application data into the StatsDataSet format
 * used by the JobStatisticsChart component in the mobile app.
 */
export function aggregateAnalyticsData(
  viewsData: JobViewAnalytics[] = [],
  applicationsData: JobApplicationAnalytics[] = [],
  groupBy: 'day' | 'week' | 'month' = 'day'
): StatsDataSet {
  // Create a map of periods to aggregate data
  const periodMap = new Map<
    string,
    { jobViews: number; jobApplications: number }
  >();

  // Add view data
  viewsData.forEach(({ period, viewCount }) => {
    if (!periodMap.has(period)) {
      periodMap.set(period, { jobViews: 0, jobApplications: 0 });
    }
    const current = periodMap.get(period);
    if (current) {
      current.jobViews += viewCount;
    }
  });

  // Add application data
  applicationsData.forEach(({ period, applicationCount }) => {
    if (!periodMap.has(period)) {
      periodMap.set(period, { jobViews: 0, jobApplications: 0 });
    }
    const current = periodMap.get(period);
    if (current) {
      current.jobApplications += applicationCount;
    }
  });

  // Sort periods chronologically
  const sortedPeriods = Array.from(periodMap.keys()).sort();

  // Create data points
  return sortedPeriods
    .map((period, index) => {
      const values = periodMap.get(period);
      if (!values) return null;

      return {
        label: formatPeriodLabel(period, groupBy, index),
        stacks: [
          { value: values.jobApplications, color: '#A855F7' }, // Purple-500 for Job Applied
          { value: values.jobViews, color: '#F59E0B' }, // Amber-500 for Job View
        ],
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

/**
 * Format a period string into a readable label for display
 */
function formatPeriodLabel(
  period: string,
  groupBy: 'day' | 'week' | 'month',
  index: number
): string {
  const date = new Date(period);

  if (groupBy === 'day') {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  } else if (groupBy === 'week') {
    return `W${index + 1}`;
  } else {
    // month
    return date.toLocaleString('default', { month: 'short' });
  }
}

/**
 * Calculate date range for different groupBy options
 * Returns [startDate, endDate] for the past N periods
 */
export function getDateRangeForPeriods(
  groupBy: 'day' | 'week' | 'month',
  periods = 7
): [Date, Date] {
  const endDate = new Date();
  const startDate = new Date();

  if (groupBy === 'day') {
    startDate.setDate(endDate.getDate() - (periods - 1));
  } else if (groupBy === 'week') {
    startDate.setDate(endDate.getDate() - (periods - 1) * 7);
  } else {
    // month
    startDate.setMonth(endDate.getMonth() - (periods - 1));
  }

  return [startDate, endDate];
}
