export const SALARY_MAX_CAP = 500_000;

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

export function isSupportedCurrency(
  value: unknown
): value is SupportedCurrency {
  return (
    typeof value === 'string' &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
  );
}

export function capFor(currency?: SupportedCurrency | null): number {
  return SALARY_CAPS[currency ?? 'USD'];
}

export function formatCurrencyValue(
  value: number,
  currency: SupportedCurrency
): string {
  const locale = CURRENCY_LOCALES[currency];
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return value.toLocaleString();
  }
}
