import type { StatsDataSet } from '@/components/employer/dashboardStatsPanel';
import type {
  JobViewAnalytics,
  JobApplicationAnalytics,
} from '@/api-client/jobs';

/**
 * Aggregates job views and application data into the StatsDataSet format
 * used by the DashboardStatsPanel component
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

  // If no data, return empty dataset with current period label
  if (sortedPeriods.length === 0) {
    return {
      data: [],
      periodLabel: getPeriodLabel(new Date(), groupBy),
      summary: {
        totalJobViews: 0,
        totalJobApplications: 0,
        jobViewsDiff: 0,
        jobApplicationsDiff: 0,
      },
    };
  }

  // Create data points
  const data = sortedPeriods
    .map((period) => {
      const values = periodMap.get(period);
      return values
        ? {
            period,
            values,
          }
        : null;
    })
    .filter((item) => item !== null)
    .map(({ period, values }, index) => ({
      label: formatPeriodLabel(period, groupBy, index),
      jobViews: values.jobViews,
      jobApplications: values.jobApplications,
    }));

  // Calculate totals and trends
  const totalJobViews = data.reduce((sum, d) => sum + d.jobViews, 0);
  const totalJobApplications = data.reduce((sum, d) => sum + d.jobApplications, 0);

  // Calculate percentage differences vs previous period
  let jobViewsDiff = 0;
  let jobApplicationsDiff = 0;

  if (data.length >= 2) {
    const lastPeriodViews = data[data.length - 1].jobViews;
    const prevPeriodViews = data[data.length - 2].jobViews;
    const lastPeriodApps = data[data.length - 1].jobApplications;
    const prevPeriodApps = data[data.length - 2].jobApplications;

    if (prevPeriodViews > 0) {
      jobViewsDiff = ((lastPeriodViews - prevPeriodViews) / prevPeriodViews) * 100;
    }
    if (prevPeriodApps > 0) {
      jobApplicationsDiff =
        ((lastPeriodApps - prevPeriodApps) / prevPeriodApps) * 100;
    }
  }

  // Determine period label (e.g., "Jul 19-25", "Jul 2026", "2026")
  const periodLabel = getPeriodLabel(new Date(), groupBy);

  return {
    data,
    periodLabel,
    summary: {
      totalJobViews,
      totalJobApplications,
      jobViewsDiff: Math.round(jobViewsDiff * 10) / 10,
      jobApplicationsDiff: Math.round(jobApplicationsDiff * 10) / 10,
    },
  };
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
 * Get a human-readable period label for the current/final period
 */
function getPeriodLabel(date: Date, groupBy: 'day' | 'week' | 'month'): string {
  if (groupBy === 'day') {
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - 6); // Last 7 days
    const month = startDate.toLocaleString('default', { month: 'short' });
    return `${month} ${startDate.getDate()}-${date.getDate()}`;
  } else if (groupBy === 'week') {
    const month = date.toLocaleString('default', { month: 'short' });
    const weekNumber = getWeekNumber(date);
    return `${month} 2026 (W${weekNumber})`;
  } else {
    // month
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  }
}

/**
 * Get the week number of the year for a given date
 */
function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
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
