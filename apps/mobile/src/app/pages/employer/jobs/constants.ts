import type { EmploymentType } from '../../../../types/job';

// ── Employment type labels ──────────────────────────────────────────────
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

// ── Currency formatting ─────────────────────────────────────────────────
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  VND: '₫',
  JPY: '¥',
  CNY: '¥',
};

export function formatSalary(
  currency: string | null,
  min: number | null,
  max: number | null
): string {
  if (!currency) return 'Not specified';
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? '';
  const hasMin = min !== null && !Number.isNaN(min);
  const hasMax = max !== null && !Number.isNaN(max);

  if (!hasMin && !hasMax) return 'Not specified';

  if (hasMin && hasMax) {
    return `${symbol}${min?.toLocaleString()} - ${symbol}${max?.toLocaleString()} ${currency.toUpperCase()}`;
  }
  if (hasMin) {
    return `From ${symbol}${min?.toLocaleString()} ${currency.toUpperCase()}`;
  }
  return `Up to ${symbol}${max?.toLocaleString()} ${currency.toUpperCase()}`;
}

// ── Date formatting ─────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface CategoryColor {
  bg: string;
  text: string;
}

const COLOR_PALETTE: CategoryColor[] = [
  { bg: '#FCE7F3', text: '#9D174D' }, // pink
  { bg: '#FEF3C7', text: '#92400E' }, // amber
  { bg: '#DBEAFE', text: '#1E40AF' }, // blue
  { bg: '#D1FAE5', text: '#065F46' }, // emerald
  { bg: '#FFEDD5', text: '#9A3412' }, // orange
  { bg: '#CCFBF1', text: '#115E59' }, // teal
  { bg: '#EDE9FE', text: '#5B21B6' }, // purple
  { bg: '#F1F5F9', text: '#1E293B' }, // slate
  { bg: '#FFE4E6', text: '#9F1239' }, // rose
  { bg: '#E0E7FF', text: '#3730A3' }, // indigo
  { bg: '#CFFAFE', text: '#155E75' }, // cyan
  { bg: '#ECFCCB', text: '#3F6212' }, // lime
];

function hashString(str: string, seed: number): number {
  let hash = seed ^ 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; // FNV prime (32-bit unsigned)
  }
  return hash >>> 0;
}

function seededRandom(hash: number): number {
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

export function getCategoryColors(categoryName: string): CategoryColor {
  const hash = hashString(categoryName, 42);
  const randomValue = seededRandom(hash);
  const colorIndex = Math.floor(randomValue * COLOR_PALETTE.length);
  return COLOR_PALETTE[colorIndex];
}
