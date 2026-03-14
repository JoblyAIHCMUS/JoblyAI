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

    if (/[\u0000-\u001F\u007F]/.test(value)) {
      return '/';
    }
  }

  return rawValue;
}

/**
 * Format an ISO date string (e.g. "2020-05-20") for display.
 * Returns a locale-independent "d Mon YYYY" string like "20 May 2020".
 */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
