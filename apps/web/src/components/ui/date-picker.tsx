'use client';

import * as React from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearStartOffset, setYearStartOffset] = useState(0);

  // Store the actual current year (today) separate from the selected month
  const actualCurrentYear = new Date().getFullYear();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();
  // For DOB, allow selecting from 1920 to actual current year
  const startYear = 1920 + yearStartOffset;
  const endYear = startYear + 19;
  // Display years in ascending order (left to right)
  // Show all 20 years in the range, but filter out future years beyond actual current year
  const years = Array.from({ length: 20 }, (_, i) => startYear + i).filter(y => y <= actualCurrentYear);

  const handlePrevYearRange = () => {
    setYearStartOffset(Math.max(0, yearStartOffset - 20));
  };

  const handleNextYearRange = () => {
    const totalYears = actualCurrentYear - 1920 + 1;
    const maxOffset = Math.max(0, totalYears - 20);
    setYearStartOffset(Math.min(maxOffset, yearStartOffset + 20));
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(month);
    newDate.setMonth(monthIndex);
    setMonth(newDate);
    setShowMonthPicker(false);
  };

  const handleOpenYearPicker = () => {
    // Calculate offset to show the selected year
    const offset = Math.max(0, Math.min(currentYear - 1920 - 19, actualCurrentYear - 1920));
    setYearStartOffset(Math.floor(offset / 20) * 20);
    setShowYearPicker(true);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(month);
    newDate.setFullYear(year);
    setMonth(newDate);
    // Calculate offset to show selected year, snapped to clean boundaries
    let newOffset = Math.floor((year - 1920) / 20) * 20;
    newOffset = Math.max(0, Math.min(newOffset, actualCurrentYear - 1920 - 19));
    setYearStartOffset(newOffset);
    setShowYearPicker(false);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() - 1);
    setMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() + 1);
    setMonth(newDate);
  };

  return (
    <div className="w-80 p-4">
      {showMonthPicker ? (
        <div className="space-y-2">
          <button
            onClick={() => setShowMonthPicker(false)}
            className="w-full text-sm font-semibold py-2 hover:bg-gray-100 rounded"
          >
            Back to Calendar
          </button>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m, idx) => (
              <button
                key={m}
                onClick={() => handleMonthSelect(idx)}
                className={cn(
                  'py-2 px-2 text-sm rounded font-medium transition-colors',
                  idx === currentMonth
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                )}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      ) : showYearPicker ? (
        <div className="space-y-2">
          <button
            onClick={() => setShowYearPicker(false)}
            className="w-full text-sm font-semibold py-2 hover:bg-gray-100 rounded"
          >
            Back to Calendar
          </button>
          <div className="flex items-center justify-between gap-2 mb-4">
            <button
              onClick={handlePrevYearRange}
              disabled={yearStartOffset === 0}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-8 w-8 p-0',
                yearStartOffset === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {years[0]} - {years[years.length - 1]}
            </span>
            <button
              onClick={handleNextYearRange}
              disabled={yearStartOffset >= actualCurrentYear - 1920 - 19}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-8 w-8 p-0',
                yearStartOffset >= actualCurrentYear - 1920 - 19 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => handleYearSelect(y)}
                className={cn(
                  'py-2 px-1 text-sm rounded font-medium transition-colors',
                  y === currentYear
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handlePrevMonth}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-8 w-8 p-0'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2 flex-1 justify-center">
              <button
                onClick={() => setShowMonthPicker(true)}
                className="text-sm font-semibold hover:bg-gray-100 px-3 py-1 rounded transition-colors"
              >
                {months[currentMonth]}
              </button>
              <button
                onClick={handleOpenYearPicker}
                className="text-sm font-semibold hover:bg-gray-100 px-3 py-1 rounded transition-colors"
              >
                {currentYear}
              </button>
            </div>
            <button
              onClick={handleNextMonth}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-8 w-8 p-0'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <style>{`
            .calendar-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 4px;
            }
            .calendar-day-header {
              text-align: center;
              font-weight: 600;
              font-size: 0.875rem;
              color: #666;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .calendar-day-cell {
              aspect-ratio: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 6px;
              font-size: 0.875rem;
              cursor: pointer;
              transition: background-color 150ms, color 150ms;
            }
            .calendar-day-cell:hover {
              background-color: #f3f4f6;
            }
          `}</style>

          <div className="calendar-grid">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}

            <DayPicker
              mode="single"
              month={month}
              onMonthChange={setMonth}
              showOutsideDays={showOutsideDays}
              className="hidden"
              classNames={{
                table: 'hidden',
                ...classNames,
              }}
              {...props}
              footer={undefined}
            />

            {(() => {
              // Manual day rendering
              const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
              const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
              const daysInMonth = lastDay.getDate();
              const startingDayOfWeek = firstDay.getDay();

              const days = [];
              for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(null);
              }
              for (let i = 1; i <= daysInMonth; i++) {
                days.push(i);
              }

              return days.map((day, idx) => (
                <div key={idx} className="calendar-day-cell">
                  {day ? (
                    <button
                      onClick={() => {
                        const selectedDate = new Date(month.getFullYear(), month.getMonth(), day);
                        props.onSelect?.(selectedDate);
                      }}
                      className={cn(
                        'w-full h-full rounded flex items-center justify-center',
                        day === new Date().getDate() && month.getMonth() === new Date().getMonth() && month.getFullYear() === new Date().getFullYear()
                          ? 'bg-blue-100 text-blue-900 font-semibold'
                          : (props.selected instanceof Date && day === props.selected.getDate() && month.getMonth() === props.selected.getMonth() && month.getFullYear() === props.selected.getFullYear())
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {day}
                    </button>
                  ) : (
                    <span className="text-gray-300">{days[idx]}</span>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
