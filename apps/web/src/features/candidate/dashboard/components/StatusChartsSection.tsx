import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { ApplicationStatus } from '../types';

type BarChartItem = {
  key: string;
  label: string;
  count: number;
};

type PieChartItem = {
  status: ApplicationStatus;
  label: string;
  color: string;
  count: number;
  percent: number;
};

type ChartView = 'timeline' | 'status';

export function StatusChartsSection({
  barChartItems,
  pieChartItems,
  pieChartBackground,
}: {
  barChartItems: {
    items: BarChartItem[];
    maxCount: number;
  };
  pieChartItems: {
    total: number;
    items: PieChartItem[];
  };
  pieChartBackground: string;
}) {
  const [activeView, setActiveView] = useState<ChartView>('status');

  const chartTabs: Array<{ key: ChartView; label: string }> = [
    { key: 'status', label: 'Status' },
    { key: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden rounded-[10px] border border-[#d6ddeb] bg-white p-4 sm:p-6">
      <div className="mt-2 max-w-full overflow-x-auto">
        <div className="inline-flex rounded-lg border border-[#d6ddeb] p-1">
          {chartTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveView(tab.key)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                activeView === tab.key
                  ? 'bg-[#eef0ff] text-[#4640de]'
                  : 'text-[#7c8493] hover:text-[#25324b]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {activeView === 'timeline' && (
          <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl p-4">
            <p className="font-[family-name:var(--family-primary)] text-lg font-semibold leading-6 text-[#25324b] sm:text-[20px]">
              CV Submitted Timeline
            </p>

            {barChartItems.items.length > 0 ? (
              <div className="mt-6 flex h-[228px] min-h-[228px] max-h-[228px] flex-1 items-end overflow-x-auto pb-2">
                <div className="grid h-full min-w-max auto-cols-[56px] grid-flow-col items-end gap-3">
                  {barChartItems.items.map((item) => {
                    const heightPercent =
                      barChartItems.maxCount > 0
                        ? (item.count / barChartItems.maxCount) * 100
                        : 0;

                    return (
                      <div
                        key={item.key}
                        className="grid h-full w-14 grid-rows-[20px_148px_32px] place-items-center"
                      >
                        <p className="text-[11px] font-semibold text-[#25324b] sm:text-xs">
                          {item.count}
                        </p>
                        <div className="flex h-[148px] w-7 items-end rounded-md bg-[#e8ecff]">
                          <div
                            className="w-full rounded-md bg-[#4640de]"
                            style={{
                              height: `${item.count > 0 ? Math.max(heightPercent, 10) : 0}%`,
                            }}
                          />
                        </div>
                        <p className="h-8 break-words text-center text-[10px] leading-4 text-[#7c8493] sm:text-[11px]">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="flex flex-1 items-end pt-4 text-sm text-[#7c8493]">
                No applications in current range.
              </p>
            )}
          </div>
        )}

        {activeView === 'status' && (
          <div className="w-full overflow-hidden rounded-xl bg-white p-4">
            <p className="font-[family-name:var(--family-primary)] text-lg font-semibold leading-6 text-[#25324b] sm:text-[20px]">
              Jobs Applied Status
            </p>

            <div className="mt-6 flex min-w-0 flex-col items-center gap-6 sm:flex-row sm:justify-center lg:gap-10 xl:gap-14">
              <div
                className="relative h-[160px] w-[160px] shrink-0 rounded-full shadow-[0_14px_30px_rgba(70,64,222,0.08)] lg:h-[188px] lg:w-[188px] xl:h-[200px] xl:w-[200px]"
                style={{ background: pieChartBackground }}
              >
                <div className="absolute inset-[22px] rounded-full bg-white lg:inset-[26px] xl:inset-[28px]" />
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                {pieChartItems.items.map((item) => (
                  <div key={item.status} className="flex items-start gap-4">
                    <span
                      className="mt-1 h-5 w-5 rounded-[4px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--family-primary)] text-sm font-semibold leading-5 text-[#25324b] sm:text-base sm:leading-[22px]">
                        {Math.round(item.percent)}% ({item.count})
                      </p>
                      <p className="break-words text-sm leading-5 text-[#515b6f] sm:text-base sm:leading-6">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}

                {pieChartItems.total === 0 && (
                  <p className="text-sm text-[#7c8493]">No applications in current range.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Link
        href="/candidate/dashboard#applications"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#4640de]"
      >
        View All Applications
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
