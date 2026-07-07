export interface JobDescriptionContent {
  overview: string;
  responsibilities: string[];
  whoYouAre: string[];
  niceToHaves: string[];
}

const EMPTY_DESCRIPTION_CONTENT: JobDescriptionContent = {
  overview: '',
  responsibilities: [],
  whoYouAre: [],
  niceToHaves: [],
};

export function parseDescription(description: string): JobDescriptionContent {
  if (!description || typeof description !== 'string') {
    return EMPTY_DESCRIPTION_CONTENT;
  }

  try {
    const parsed = JSON.parse(description) as Partial<JobDescriptionContent>;

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

    return {
      overview: description || EMPTY_DESCRIPTION_CONTENT.overview,
      responsibilities: EMPTY_DESCRIPTION_CONTENT.responsibilities,
      whoYouAre: EMPTY_DESCRIPTION_CONTENT.whoYouAre,
      niceToHaves: EMPTY_DESCRIPTION_CONTENT.niceToHaves,
    };
  } catch {
    return {
      overview: description || EMPTY_DESCRIPTION_CONTENT.overview,
      responsibilities: EMPTY_DESCRIPTION_CONTENT.responsibilities,
      whoYouAre: EMPTY_DESCRIPTION_CONTENT.whoYouAre,
      niceToHaves: EMPTY_DESCRIPTION_CONTENT.niceToHaves,
    };
  }
}

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
    const numberFormatter = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    });

    return `${numberFormatter.format(rangeMin)}-${numberFormatter.format(
      rangeMax
    )} ${currencyCode}`;
  }
}

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

export function formatDate(
  date: Date | string | null | undefined,
  format: 'full' | 'short' = 'full'
): string {
  if (!date) return 'Unknown';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

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

/**
 * Extracts a plain-text preview from a job description for card display.
 *
 * - If description is structured JSON, extracts the `overview` field.
 * - Finds the first <p> tag content when available.
 * - Falls back to stripping all HTML tags.
 * - Collapses whitespace and truncates to a consistent length.
 */
export function getCardPreviewText(description: string): string {
  if (!description || typeof description !== 'string') return '';

  let html: string;

  try {
    const parsed = JSON.parse(description) as Partial<JobDescriptionContent>;
    if (parsed.overview) {
      html = parsed.overview;
    } else {
      html = description;
    }
  } catch {
    html = description;
  }

  const firstParagraph = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const raw = firstParagraph ? firstParagraph[1] : html;

  const plain = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= 120) return plain;
  return plain.slice(0, 120).trimEnd() + '…';
}
