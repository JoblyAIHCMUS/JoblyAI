import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Accept only same-origin relative paths for post-auth redirects.
 * Falls back to '/' when the value looks external or malformed.
 */
export function sanitizeRedirectPath(redirectTo?: string | null): string {
  if (!redirectTo) {
    return '/';
  }

  const rawValue = redirectTo.trim();
  if (!rawValue) {
    return '/';
  }

  const variants = new Set<string>([rawValue]);
  let current = rawValue;

  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) {
        break;
      }
      variants.add(decoded);
      current = decoded;
    } catch {
      break;
    }
  }

  for (const value of variants) {
    if (!value.startsWith('/')) {
      return '/';
    }

    if (value.startsWith('//')) {
      return '/';
    }

    if (value.includes('\\')) {
      return '/';
    }

    if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) {
      return '/';
    }

    const hasControlChars = Array.from(value).some((char) => {
      const code = char.charCodeAt(0);
      return code <= 31 || code === 127;
    });

    if (hasControlChars) {
      return '/';
    }
  }

  return rawValue;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

import type {
  JobDescriptionContent,
  CategoryPillColor,
} from '@/types/jobDetail';

export const EMPTY_DESCRIPTION_CONTENT: JobDescriptionContent = {
  overview: '',
  responsibilities: [],
  whoYouAre: [],
  niceToHaves: [],
};

export const CATEGORY_COLOR_MAP: Record<string, CategoryPillColor> = {
  marketing: 'orange',
  sales: 'orange',
  design: 'teal',
  engineering: 'teal',
  product: 'teal',
  operations: 'teal',
  hr: 'orange',
  finance: 'teal',
};

/**
 * Parses a job description JSON string into structured content.
 *
 * Supports two formats:
 * 1. Structured JSON: { overview, responsibilities: [], whoYouAre: [], niceToHaves: [] }
 * 2. Plain text: falls back to using entire string as overview
 *
 * Safely handles malformed JSON and missing fields.
 * Backend is still in development - may only send plain text description.
 */
export function parseDescription(description: string): JobDescriptionContent {
  if (!description || typeof description !== 'string') {
    return EMPTY_DESCRIPTION_CONTENT;
  }

  try {
    const parsed = JSON.parse(description) as Partial<JobDescriptionContent>;

    // Has structured content (backend fully developed)
    if (
      parsed.overview ||
      parsed.responsibilities ||
      parsed.whoYouAre ||
      parsed.niceToHaves
    ) {
      return {
        overview: parsed.overview ?? EMPTY_DESCRIPTION_CONTENT.overview,
        responsibilities: Array.isArray(parsed.responsibilities)
          ? parsed.responsibilities
          : EMPTY_DESCRIPTION_CONTENT.responsibilities,
        whoYouAre: Array.isArray(parsed.whoYouAre)
          ? parsed.whoYouAre
          : EMPTY_DESCRIPTION_CONTENT.whoYouAre,
        niceToHaves: Array.isArray(parsed.niceToHaves)
          ? parsed.niceToHaves
          : EMPTY_DESCRIPTION_CONTENT.niceToHaves,
      };
    }

    // Fallback: treat the entire string as overview if JSON parsing succeeded but no structured fields
    return {
      overview: description || EMPTY_DESCRIPTION_CONTENT.overview,
      responsibilities: EMPTY_DESCRIPTION_CONTENT.responsibilities,
      whoYouAre: EMPTY_DESCRIPTION_CONTENT.whoYouAre,
      niceToHaves: EMPTY_DESCRIPTION_CONTENT.niceToHaves,
    };
  } catch {
    // JSON parse failed - treat entire string as plain text overview
    // This handles backend-in-development case where description is just a string
    return {
      overview: description || EMPTY_DESCRIPTION_CONTENT.overview,
      responsibilities: EMPTY_DESCRIPTION_CONTENT.responsibilities,
      whoYouAre: EMPTY_DESCRIPTION_CONTENT.whoYouAre,
      niceToHaves: EMPTY_DESCRIPTION_CONTENT.niceToHaves,
    };
  }
}

/**
 * Calculates application progress as a percentage string.
 * Returns "0%" for invalid inputs, clamped to 0-100%.
 */
export function calculateApplicationProgress(
  appliedCount: number,
  capacity: number
): string {
  if (!Number.isFinite(appliedCount) || !Number.isFinite(capacity)) {
    return '0%';
  }

  if (capacity <= 0) return '0%';

  const percent = (appliedCount / capacity) * 100;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const roundedPercent = Number(clampedPercent.toFixed(2));

  return `${roundedPercent}%`;
}

/**
 * Formats salary range using the appropriate currency formatter.
 * Falls back to simple number formatting if currency is invalid.
 */
export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null
): string {
  const salaryMin = Number.isFinite(min) ? (min as number) : 0;
  const salaryMax = Number.isFinite(max) ? (max as number) : 0;
  const rangeMin = Math.min(salaryMin, salaryMax);
  const rangeMax = Math.max(salaryMin, salaryMax);

  const currencyCode = currency ?? 'USD';

  try {
    const currencyFormatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    });

    return `${currencyFormatter.format(rangeMin)}-${currencyFormatter.format(
      rangeMax
    )}`;
  } catch {
    // Fallback if currency code is invalid
    const numberFormatter = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    });

    return `${numberFormatter.format(rangeMin)}-${numberFormatter.format(
      rangeMax
    )} ${currencyCode}`;
  }
}

/**
 * Maps a category name to a color.
 * Uses predefined mapping with 'teal' as fallback.
 */
export function getCategoryColor(categoryName: string): CategoryPillColor {
  const normalizedName = categoryName.toLowerCase();
  return CATEGORY_COLOR_MAP[normalizedName] ?? 'teal';
}

/**
 * Determines job type display string from employment type.
 * Converts enum values like FULL_TIME to "Full-time".
 * @deprecated Use formatEmploymentType from @/lib/employment-type-config instead
 */
export function formatJobType(employmentType: string): string {
  const typeMap: Record<string, string> = {
    FULL_TIME: 'Full-Time',
    PART_TIME: 'Part-Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    FREELANCE: 'Freelance',
  };
  return typeMap[employmentType] ?? employmentType;
}

/**
 * Formats date to display format (e.g., January 15, 2026).
 * Handles both Date objects and string dates from API responses.
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: 'full' | 'short' = 'full'
): string {
  if (!date) return 'Unknown';

  try {
    const dateObj =
      typeof date === 'string' ? new Date(date) : date;

    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Unknown';
    }

    if (format === 'short') {
      return dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch {
    return 'Unknown';
  }
}