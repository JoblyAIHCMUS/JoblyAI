import { useMemo } from 'react';

import { ApplicationStatus } from '@/types/candidate';
import { toDateInputValue } from '@/lib/candidateDate';
import {
  DashboardInsightsParams,
  DashboardInsightsResult,
} from '@/features/candidate/dashboard/types';

export function useDashboardInsights({
  filteredApplications,
  selectedStartDate,
  selectedEndDate,
  statusMeta,
}: DashboardInsightsParams): DashboardInsightsResult {
  const statusChartColors: Record<ApplicationStatus, string> = {
    applied: '#7c8493',
    viewed: '#1fb5e9',
    interviewing: '#4640de',
    offered: '#00a36c',
    rejected: '#ff6550',
  };

  const barChartItems = useMemo(() => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const toStartOfDay = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const addDays = (date: Date, amount: number) => {
      const next = new Date(date);
      next.setDate(next.getDate() + amount);
      return next;
    };

    const validDates = filteredApplications
      .map((item) => new Date(`${item.createdAt}T00:00:00`))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(toStartOfDay);

    const selectedStart = selectedStartDate
      ? new Date(`${selectedStartDate}T00:00:00`)
      : null;
    const selectedEnd = selectedEndDate
      ? new Date(`${selectedEndDate}T00:00:00`)
      : null;

    const minDataDate =
      validDates.length > 0
        ? new Date(Math.min(...validDates.map((date) => date.getTime())))
        : null;
    const maxDataDate =
      validDates.length > 0
        ? new Date(Math.max(...validDates.map((date) => date.getTime())))
        : null;

    const startDate = selectedStart ?? minDataDate;
    const endDate = selectedEnd ?? maxDataDate;

    if (!startDate || !endDate || endDate < startDate) {
      return {
        items: [],
        maxCount: 0,
      };
    }

    const dayCount =
      Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;

    const countByDay = new Map<string, number>();
    validDates.forEach((date) => {
      const dateKey = toDateInputValue(date);
      countByDay.set(dateKey, (countByDay.get(dateKey) ?? 0) + 1);
    });

    const buckets: Array<{
      key: string;
      label: string;
      start: Date;
      end: Date;
    }> = [];

    const formatWeekLabel = (start: Date, end: Date) => {
      const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
      const startDay = start.getDate();
      const endDay = end.getDate();

      if (startMonth === endMonth) {
        return `${startMonth} ${startDay}-${endDay}`;
      }

      return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
    };

    if (dayCount > 730) {
      for (
        let year = startDate.getFullYear();
        year <= endDate.getFullYear();
        year += 1
      ) {
        const bucketStart =
          year === startDate.getFullYear()
            ? new Date(startDate)
            : new Date(year, 0, 1);
        const bucketEnd =
          year === endDate.getFullYear()
            ? new Date(endDate)
            : new Date(year, 11, 31);

        buckets.push({
          key: `${year}`,
          label: `${year}`,
          start: bucketStart,
          end: bucketEnd,
        });
      }
    } else if (dayCount > 35) {
      let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (cursor <= endMonth) {
        const monthStart =
          cursor.getFullYear() === startDate.getFullYear() &&
          cursor.getMonth() === startDate.getMonth()
            ? new Date(startDate)
            : new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const monthEndCandidate = new Date(
          cursor.getFullYear(),
          cursor.getMonth() + 1,
          0
        );
        const monthEnd =
          monthEndCandidate > endDate ? new Date(endDate) : monthEndCandidate;

        buckets.push({
          key: `${cursor.getFullYear()}-${String(
            cursor.getMonth() + 1
          ).padStart(2, '0')}`,
          label: cursor.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          start: monthStart,
          end: monthEnd,
        });

        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      }
    } else if (dayCount > 7) {
      let cursor = new Date(startDate);

      while (cursor <= endDate) {
        const weekStart = new Date(cursor);
        const weekEndCandidate = addDays(weekStart, 6);
        const weekEnd =
          weekEndCandidate > endDate ? new Date(endDate) : weekEndCandidate;

        buckets.push({
          key: `${toDateInputValue(weekStart)}-${toDateInputValue(weekEnd)}`,
          label: formatWeekLabel(weekStart, weekEnd),
          start: weekStart,
          end: weekEnd,
        });

        cursor = addDays(weekEnd, 1);
      }
    } else {
      let cursor = new Date(startDate);

      while (cursor <= endDate) {
        const key = toDateInputValue(cursor);
        buckets.push({
          key,
          label: cursor.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          start: new Date(cursor),
          end: new Date(cursor),
        });

        cursor = addDays(cursor, 1);
      }
    }

    const items = buckets.map((bucket) => {
      let count = 0;
      let cursor = new Date(bucket.start);

      while (cursor <= bucket.end) {
        count += countByDay.get(toDateInputValue(cursor)) ?? 0;
        cursor = addDays(cursor, 1);
      }

      return {
        key: bucket.key,
        label: bucket.label,
        count,
      };
    });

    const maxCount = items.reduce((max, item) => Math.max(max, item.count), 0);

    return {
      items,
      maxCount,
    };
  }, [filteredApplications, selectedEndDate, selectedStartDate]);

  const pieChartItems = useMemo(() => {
    const statusOrder: ApplicationStatus[] = [
      'applied',
      'viewed',
      'interviewing',
      'offered',
      'rejected',
    ];

    const total = filteredApplications.length;

    const counts = statusOrder.map((status) => {
      const count = filteredApplications.filter(
        (item) => item.status === status
      ).length;

      return {
        status,
        label: statusMeta[status].label,
        color: statusChartColors[status],
        count,
        percent: total > 0 ? (count / total) * 100 : 0,
      };
    });

    return {
      total,
      items: counts.filter((item) => item.count > 0),
    };
  }, [filteredApplications, statusMeta]);

  const pieChartBackground = useMemo(() => {
    if (pieChartItems.total === 0 || pieChartItems.items.length === 0) {
      return 'conic-gradient(#eef2ff 0% 100%)';
    }

    let current = 0;
    const segments = pieChartItems.items.map((item) => {
      const start = current;
      const end = current + item.percent;
      current = end;
      return `${item.color} ${start}% ${end}%`;
    });

    return `conic-gradient(${segments.join(',')})`;
  }, [pieChartItems]);

  const interviewedCount = useMemo(() => {
    return filteredApplications.filter(
      (item) =>
        item.status === 'interviewing' ||
        item.status === 'offered' ||
        item.status === 'rejected'
    ).length;
  }, [filteredApplications]);

  return {
    barChartItems,
    pieChartItems,
    pieChartBackground,
    interviewedCount,
  };
}
