import type { DatePreset, DateRange, DateRangeInput } from './types';

function startOfDay(date: Date): Date {
  const nextDate = new Date(date);

  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

function endOfDay(date: Date): Date {
  const nextDate = new Date(date);

  nextDate.setHours(23, 59, 59, 999);

  return nextDate;
}

export function createRelativeDate(daysAgo: number): Date {
  const nextDate = new Date();

  nextDate.setDate(nextDate.getDate() - daysAgo);

  return nextDate;
}

export function createDefaultDateRange(): DateRange {
  const today = new Date();

  return {
    from: startOfDay(createRelativeDate(6)),
    to: endOfDay(today),
  };
}

export function getDateRangeForPreset(preset: DatePreset): DateRange {
  const today = new Date();

  if (preset === 'TODAY') {
    return {
      from: startOfDay(today),
      to: endOfDay(today),
    };
  }

  if (preset === 'LAST_30_DAYS') {
    return {
      from: startOfDay(createRelativeDate(29)),
      to: endOfDay(today),
    };
  }

  return createDefaultDateRange();
}

export function formatDateRangeLabel(range: DateRange): string {
  return `${formatLongDate(range.from)} - ${formatLongDate(range.to)}`;
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatInputDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

export function parseDateInput(value: string): Date | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getFullYear() !== year
  ) {
    return null;
  }

  return parsed;
}

export function isWithinDateRange(date: Date, range: DateRange): boolean {
  return date >= range.from && date <= range.to;
}

export function toDateRangeInput(range: DateRange): DateRangeInput {
  return {
    from: formatInputDate(range.from),
    to: formatInputDate(range.to),
  };
}

export function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
}
