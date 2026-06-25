import type { FilterGroupData, SortOption } from '@/types/job';

export const SORT_OPTIONS: SortOption[] = [
  'MOST_RELEVANT',
  'NEWEST',
  'OLDEST',
  'SALARY_ASC',
  'SALARY_DESC',
];

export const FILTER_GROUPS: FilterGroupData[] = [
  {
    title: 'Type of Employment',
    items: [
      { label: 'Full-time' },
      { label: 'Part-Time' },
      { label: 'Internship' },
      { label: 'Contract' },
      { label: 'Freelance' },
    ],
    checked: [],
  },
  {
    title: 'Categories',
    items: [
      { label: 'Design' },
      { label: 'Sales' },
      { label: 'Marketing' },
      { label: 'Business' },
      { label: 'Human Resource' },
      { label: 'Finance' },
      { label: 'Engineering' },
      { label: 'Technology' },
    ],
    checked: [],
  },
];

export const SALARY_MAX_CAP = 500_000;
export const PAGE_SIZE = 15;

export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'VND',
  'JPY',
  'CNY',
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const SALARY_CAPS: Record<SupportedCurrency, number> = {
  USD: 500_000,
  EUR: 450_000,
  GBP: 400_000,
  VND: 1_200_000_000,
  JPY: 75_000_000,
  CNY: 3_500_000,
};

export const SALARY_STEPS: Record<SupportedCurrency, number> = {
  USD: 100,
  EUR: 100,
  GBP: 100,
  VND: 1_000_000,
  JPY: 10_000,
  CNY: 1_000,
};

export const CURRENCY_LOCALES: Record<SupportedCurrency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  VND: 'vi-VN',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
};

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return (
    typeof value === 'string' &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
  );
}

export function capFor(currency?: SupportedCurrency): number {
  return SALARY_CAPS[currency ?? 'USD'];
}
