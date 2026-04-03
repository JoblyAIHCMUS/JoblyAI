'use client';

import * as Slider from '@radix-ui/react-slider';
import { useEffect, useState } from 'react';

const SALARY_MAX = 200_000;

export default function SalaryFilter({
  onSalaryChange,
}: {
  onSalaryChange?: (min: number, max: number) => void;
}) {
  const [value, setValue] = useState([0, SALARY_MAX]);

  // debounce giống bạn
  useEffect(() => {
    const timer = setTimeout(() => {
      onSalaryChange?.(value[0], value[1]);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSalaryChange]);

  return (
    <div className="flex flex-col gap-4 px-2 py-2 w-full">
      <h3 className="text-base font-semibold text-slate-900">Salary (USD)</h3>

      <div className="flex justify-between text-sm text-slate-600">
        <span>{value[0] / 1000}k</span>
        <span>{value[1] / 1000}k</span>
      </div>

      <Slider.Root
        value={value}
        min={0}
        max={SALARY_MAX}
        step={1000}
        onValueChange={setValue}
        className="relative flex items-center w-full h-10"
      >
        <Slider.Track className="bg-slate-200 relative grow h-2 rounded-full">
          <Slider.Range className="absolute bg-indigo-600 h-full rounded-full" />
        </Slider.Track>

        <Slider.Thumb className="block w-5 h-5 bg-white border border-indigo-600 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <Slider.Thumb className="block w-5 h-5 bg-white border border-indigo-600 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </Slider.Root>
    </div>
  );
}
