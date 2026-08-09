const COMPACT_UNITS = [
  { divisor: 1_000_000_000, suffix: 'B' },
  { divisor: 1_000_000, suffix: 'M' },
  { divisor: 1_000, suffix: 'K' },
] as const;

function formatCompactCurrencyAmount(
  value: number,
  currencyCode: string
): string {
  let unitIndex = COMPACT_UNITS.findIndex(
    ({ divisor }) => Math.abs(value) >= divisor
  );
  if (unitIndex === -1) unitIndex = COMPACT_UNITS.length;

  let divisor =
    unitIndex < COMPACT_UNITS.length ? COMPACT_UNITS[unitIndex].divisor : 1;
  let suffix =
    unitIndex < COMPACT_UNITS.length ? COMPACT_UNITS[unitIndex].suffix : '';
  let scaled = value / divisor;
  let rounded = Math.round(scaled * 10) / 10;

  while (
    unitIndex > 0 &&
    unitIndex < COMPACT_UNITS.length &&
    Math.abs(rounded) >= 1000
  ) {
    unitIndex -= 1;
    divisor = COMPACT_UNITS[unitIndex].divisor;
    suffix = COMPACT_UNITS[unitIndex].suffix;
    scaled = value / divisor;
    rounded = Math.round(scaled * 10) / 10;
  }

  const fractionDigits = Number.isInteger(rounded) ? 0 : 1;

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    });
    return `${formatter.format(rounded)}${suffix}`;
  } catch {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    });
    return `${formatter.format(rounded)} ${currencyCode}${suffix}`;
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

  const currencyCode = currency?.trim().toUpperCase() || 'USD';

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

export function formatCompactSalary(
  min: number | null,
  max: number | null,
  currency: string | null
): string {
  const currencyCode = currency?.trim().toUpperCase() || 'USD';
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);

  if (!hasMin && !hasMax) return 'Not specified';
  if (hasMin && !hasMax) {
    return `${formatCompactCurrencyAmount(
      min as number,
      currencyCode
    )} Competitive`;
  }
  if (!hasMin && hasMax) {
    return formatCompactCurrencyAmount(max as number, currencyCode);
  }

  return `${formatCompactCurrencyAmount(
    min as number,
    currencyCode
  )} — ${formatCompactCurrencyAmount(max as number, currencyCode)}`;
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
 * - Accepts HTML or plain-text descriptions.
 * - Finds the first <p> tag content when available.
 * - Falls back to stripping all HTML tags.
 * - Collapses whitespace and truncates to a consistent length.
 */
export function getCardPreviewText(description: string): string {
  if (!description || typeof description !== 'string') return '';

  const firstParagraph = description.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const raw = firstParagraph ? firstParagraph[1] : description;

  const plain = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= 120) return plain;
  return plain.slice(0, 120).trimEnd() + '…';
}

/**
 * Normalizes a job description for rendering.
 *
 * - Removes empty <p> blocks and standalone <br> nodes that rich editors
 *   leave behind when the author presses Enter multiple times.
 * - Removes only block-boundary breaks, preserving intentional inline breaks.
 * - Preserves all formatting tags, entities, and inline content.
 */
export function normalizeDescriptionHtml(description: string): string {
  if (!description || typeof description !== 'string') return '';

  return description
    .replace(/<p[^>]*>(?:\s|&nbsp;|&#10;|&#xA;|<br\s*\/?>)*<\/p>/gi, '')
    .replace(
      /(<\/(?:p|div|ul|ol|h[1-6]|blockquote|pre|section)>)(?:(?:\s|&nbsp;|&#10;|&#xA;)*<br\s*\/?>)+(?:\s|&nbsp;|&#10;|&#xA;)*(?=<(?:p|div|ul|ol|h[1-6]|blockquote|pre|section)\b)/gi,
      '$1'
    )
    .replace(/^(?:(?:\s|&nbsp;|&#10;|&#xA;)*<br\s*\/?>)+/i, '')
    .replace(/(?:<br\s*\/?>\s*)+$/i, '')
    .replace(/(?:&(?:#10|#xA);)+(?=\s*<)/gi, '')
    .replace(/(?:&(?:#10|#xA);)+\s*$/gi, '')
    .trim();
}
