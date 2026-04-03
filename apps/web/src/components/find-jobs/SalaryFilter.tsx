'use client';

import {
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';

interface SalaryFilterProps {
  salaryMin: number;
  salaryMax: number;
  setSalaryMin: Dispatch<SetStateAction<number>>;
  setSalaryMax: Dispatch<SetStateAction<number>>;
}

const MAX_SALARY_USD = 200_000;
const API_UNIT_VALUE = 1_000; // 1 unit => 1000 USD
const MAX_UNITS = MAX_SALARY_USD / API_UNIT_VALUE;

function toUnit(value: number): number {
  return Math.round(value / API_UNIT_VALUE);
}

function toSalaryValue(unit: number): number {
  return unit * API_UNIT_VALUE;
}

function formatSalaryFromUnit(unit: number): string {
  return `${unit}k`;
}

export default function SalaryFilter({
  salaryMin,
  salaryMax,
  setSalaryMin,
  setSalaryMax,
}: SalaryFilterProps) {
  const [draftMin, setDraftMin] = useState(toUnit(salaryMin));
  const [draftMax, setDraftMax] = useState(toUnit(salaryMax));
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraftMin(toUnit(salaryMin));
  }, [salaryMin]);

  useEffect(() => {
    setDraftMax(toUnit(salaryMax));
  }, [salaryMax]);

  useEffect(() => {
    if (!activeThumb) return;

    const updateValueFromPointer = (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const newUnit = Math.round(
        ((clientX - rect.left) / rect.width) * MAX_UNITS
      );
      const clampedUnit = Math.min(MAX_UNITS, Math.max(0, newUnit));

      if (activeThumb === 'min') {
        setDraftMin(Math.min(clampedUnit, draftMax));
      } else {
        setDraftMax(Math.max(clampedUnit, draftMin));
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      updateValueFromPointer(event.clientX);
    };

    const handlePointerUp = (event: PointerEvent) => {
      event.preventDefault();
      setSalaryMin(toSalaryValue(draftMin));
      setSalaryMax(toSalaryValue(draftMax));
      setActiveThumb(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeThumb, draftMin, draftMax, setSalaryMax, setSalaryMin]);

  const minPercent = (draftMin / MAX_UNITS) * 100;
  const maxPercent = (draftMax / MAX_UNITS) * 100;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4">
      <h3 className="text-base font-semibold text-slate-900">Salary (USD)</h3>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{formatSalaryFromUnit(draftMin)}</span>
          <span>{formatSalaryFromUnit(draftMax)}</span>
        </div>

        <div ref={trackRef} className="relative h-10 w-full select-none">
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
          <div
            className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-indigo-500"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />

          <button
            type="button"
            aria-label="Minimum salary"
            onPointerDown={() => setActiveThumb('min')}
            className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-600 shadow-md transition-transform ${
              activeThumb === 'min' ? 'z-30 scale-110' : 'z-20'
            }`}
            style={{ left: `calc(${minPercent}% - 10px)` }}
          />

          <button
            type="button"
            aria-label="Maximum salary"
            onPointerDown={() => setActiveThumb('max')}
            className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-600 shadow-md transition-transform ${
              activeThumb === 'max' ? 'z-30 scale-110' : 'z-20'
            }`}
            style={{ left: `calc(${maxPercent}% - 10px)` }}
          />
        </div>
      </div>
    </div>
  );
}
