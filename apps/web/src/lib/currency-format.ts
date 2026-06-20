export type CurrencyCode = 'none' | 'usd' | 'eur' | 'gbp' | 'vnd' | 'jpy' | 'cny';

const LOCALE_MAP: Record<CurrencyCode, string> = {
  none: '',
  usd: 'en-US',
  eur: 'de-DE',
  gbp: 'en-GB',
  vnd: 'vi-VN',
  jpy: 'ja-JP',
  cny: 'zh-CN',
};

const SYMBOL_MAP: Record<CurrencyCode, string> = {
  none: '',
  usd: '$',
  eur: '€',
  gbp: '£',
  vnd: '₫',
  jpy: '¥',
  cny: '¥',
};

export function currencyToLocale(currency: CurrencyCode): string {
  return LOCALE_MAP[currency] ?? '';
}

export function currencySymbol(currency: CurrencyCode): string {
  return SYMBOL_MAP[currency] ?? '';
}

export function formatSalaryNumber(
  value: number | null | undefined,
  locale: string
): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '';
  if (!locale) return value.toString();
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

export function computeCaretAfterFormat(
  prevDisplay: string,
  prevCaret: number,
  newDisplay: string
): number {
  const digitsBefore = prevDisplay
    .slice(0, prevCaret)
    .replace(/\D/g, '').length;
  if (digitsBefore === 0) return newDisplay.length;
  let count = 0;
  for (let i = 0; i < newDisplay.length; i++) {
    if (/\d/.test(newDisplay[i])) count++;
    if (count === digitsBefore) return i + 1;
  }
  return newDisplay.length;
}
