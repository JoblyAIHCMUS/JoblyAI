'use client';

import * as Slider from '@radix-ui/react-slider';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
  SUPPORTED_CURRENCIES,
  SALARY_CAPS,
  SALARY_STEPS,
  CURRENCY_LOCALES,
  SupportedCurrency,
  capFor,
} from '@/features/find-jobs/constants';

interface SalaryFilterProps {
  onSalaryChange?: (min: number, max: number) => void;
  onCurrencyChange?: (currency: SupportedCurrency | undefined) => void;
  currency: SupportedCurrency | undefined;
  initialMin?: number;
  initialMax?: number;
}

function formatCurrencyValue(
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

const SalaryFilter = forwardRef<{ reset: () => void }, SalaryFilterProps>(
  (
    { onSalaryChange, onCurrencyChange, currency, initialMin = 0, initialMax },
    ref
  ) => {
    const effectiveMax = initialMax ?? capFor(currency);
    const [value, setValue] = useState<[number, number]>([
      initialMin,
      effectiveMax,
    ]);

    useImperativeHandle(ref, () => ({
      reset() {
        setValue([0, capFor(currency)]);
      },
    }));

    // Update internal value if initial values or currency change (e.g. from URL sync)
    useEffect(() => {
      setValue([initialMin, initialMax ?? capFor(currency)]);
    }, [initialMin, initialMax, currency]);

    // debounce salary changes
    useEffect(() => {
      const timer = setTimeout(() => {
        onSalaryChange?.(value[0], value[1]);
      }, 300);

      return () => clearTimeout(timer);
    }, [value, onSalaryChange]);

    const handleCurrencyChange = (
      newCurrency: SupportedCurrency | undefined
    ) => {
      if (!newCurrency) {
        onCurrencyChange?.(undefined);
        return;
      }
      const newCap = capFor(newCurrency);
      // Reset slider to full range of the new currency.
      // Clamping would keep a stale USD cap (500k) when switching to VND,
      // re-introducing the exact bug this feature fixes.
      setValue([0, newCap]);
      onCurrencyChange?.(newCurrency);
    };

    return (
      <div className="flex flex-col gap-4 px-2 py-2 w-full text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Salary ({currency || 'All'})
          </h3>
          <select
            value={currency ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              handleCurrencyChange(
                v === '' ? undefined : (v as SupportedCurrency)
              );
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            aria-label="Salary currency"
          >
            <option value="">All</option>
            {SUPPORTED_CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        {currency ? (
          <>
            <div className="flex justify-between text-sm text-slate-600 font-medium mb-1">
              <span>{formatCurrencyValue(value[0], currency)}</span>
              <span>{formatCurrencyValue(value[1], currency)}</span>
            </div>

            <Slider.Root
              value={value}
              min={0}
              max={SALARY_CAPS[currency]}
              step={SALARY_STEPS[currency]}
              onValueChange={(newValue) =>
                setValue([newValue[0], newValue[1]] as [number, number])
              }
              className="relative flex items-center w-full h-10 select-none touch-none"
            >
              <Slider.Track className="bg-slate-200 relative grow h-2 rounded-full cursor-pointer">
                <Slider.Range className="absolute bg-indigo-600 h-full rounded-full" />
              </Slider.Track>

              <Slider.Thumb className="block w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all hover:scale-110" />
              <Slider.Thumb className="block w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all hover:scale-110" />
            </Slider.Root>
          </>
        ) : null}
      </div>
    );
  }
);

SalaryFilter.displayName = 'SalaryFilter';

export default SalaryFilter;
