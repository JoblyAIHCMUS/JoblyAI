/**
 * Format a date range for display (e.g., "Jun 2019 - Present" or "Jan 2020 - Dec 2021")
 */
export function formatDateRange(
  startDate: string | Date | undefined,
  endDate: string | Date | undefined
): string {
  if (!startDate) {
    return 'No date provided';
  }

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Present';

  return `${start} - ${end}`;
}

/**
 * Format a date for display (e.g., "Jun 2019")
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) {
    return '';
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Format a full date for display (e.g., "June 19, 2019")
 */
export function formatFullDate(date: string | Date | undefined): string {
  if (!date) {
    return '';
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}
