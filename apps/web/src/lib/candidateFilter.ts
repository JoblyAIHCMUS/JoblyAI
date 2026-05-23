import { ApplicationItem } from '@/types/candidate';

function parseCreatedAt(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function filterApplicationsByDate(
  items: ApplicationItem[],
  startDate?: string,
  endDate?: string
) {
  if (!startDate && !endDate) {
    return items;
  }

  return items.filter((item) => {
    const createdAt = parseCreatedAt(item.createdAt);
    if (!createdAt) {
      return false;
    }

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      if (createdAt < start) {
        return false;
      }
    }

    if (endDate) {
      const end = new Date(`${endDate}T23:59:59`);
      if (createdAt > end) {
        return false;
      }
    }

    return true;
  });
}

export function getUniqueFilterOptions(
  items: ApplicationItem[],
  field: 'company' | 'jobType' | 'location'
) {
  return Array.from(new Set(items.map((item) => item[field]))).sort((a, b) =>
    a.localeCompare(b)
  );
}
