'use client';

import { ApplicationFilter } from '@/types/candidate';
import { StatusTab } from '../types';

type ApplicationStatusTabsProps = {
  tabs: StatusTab[];
  activeFilter: ApplicationFilter;
  onChangeFilter: (filter: ApplicationFilter) => void;
};

export function ApplicationStatusTabs({
  tabs,
  activeFilter,
  onChangeFilter,
}: ApplicationStatusTabsProps) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-6 border-b border-[#d6ddeb]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChangeFilter(tab.key)}
            className={`border-b-2 px-1 pb-2 pt-1 text-base font-medium ${
              activeFilter === tab.key
                ? 'border-[#4640de] text-[#4640de]'
                : 'border-transparent text-[#515b6f]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
    </section>
  );
}
