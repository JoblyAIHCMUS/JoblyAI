'use client';

import * as Slider from '@radix-ui/react-slider';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { SALARY_MAX_CAP } from '@/features/find-jobs/constants';

const SalaryFilter = forwardRef(
  (
    {
      onSalaryChange,
      initialMin = 0,
      initialMax = SALARY_MAX_CAP,
    }: {
      onSalaryChange?: (min: number, max: number) => void;
      initialMin?: number;
      initialMax?: number;
    },
    ref
  ) => {
    const [value, setValue] = useState([initialMin, initialMax]);

    useImperativeHandle(ref, () => ({
      reset() {
        setValue([0, SALARY_MAX_CAP]);
      },
    }));

    // Update internal value if initial values change (e.g. from URL sync back)
    useEffect(() => {
      setValue([initialMin, initialMax]);
    }, [initialMin, initialMax]);

    // debounce
    useEffect(() => {
      const timer = setTimeout(() => {
        onSalaryChange?.(value[0], value[1]);
      }, 300);

      return () => clearTimeout(timer);
    }, [value, onSalaryChange]);

    return (
      <div className="flex flex-col gap-4 px-2 py-2 w-full text-left">
        <h3 className="text-base font-semibold text-slate-900">Salary (USD)</h3>

        <div className="flex justify-between text-sm text-slate-600 font-medium mb-1">
          <span>${value[0].toLocaleString()}</span>
          <span>${value[1].toLocaleString()}</span>
        </div>

        <Slider.Root
          value={value}
          min={0}
          max={SALARY_MAX_CAP}
          step={100}
          onValueChange={setValue}
          className="relative flex items-center w-full h-10 select-none touch-none"
        >
          <Slider.Track className="bg-slate-200 relative grow h-2 rounded-full cursor-pointer">
            <Slider.Range className="absolute bg-indigo-600 h-full rounded-full" />
          </Slider.Track>

          <Slider.Thumb className="block w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all hover:scale-110" />
          <Slider.Thumb className="block w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-grab active:cursor-grabbing focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all hover:scale-110" />
        </Slider.Root>
      </div>
    );
  }
);

SalaryFilter.displayName = 'SalaryFilter';

export default SalaryFilter;
