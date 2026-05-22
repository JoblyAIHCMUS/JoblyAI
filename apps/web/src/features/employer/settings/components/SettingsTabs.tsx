/* Copied from candidate/settings/components/SettingsTabs.tsx */
'use client';

import React from 'react';
import { Tabs, TabsList } from '@/components/ui/tabs';

interface Tab {
  id: string;
  label: string;
}

interface SettingsTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children?: React.ReactNode;
}

export function SettingsTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
}: SettingsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="inline-flex justify-start items-start gap-2 sm:gap-6 md:gap-10 bg-transparent p-0 h-auto overflow-x-auto border-b border-[#d6ddeb] w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="inline-flex flex-col justify-start items-center gap-2 bg-transparent border-none cursor-pointer p-0 h-auto flex-shrink-0"
            >
              <div
                className={`justify-center text-xs sm:text-sm md:text-base font-medium font-['Lexend_Deca'] leading-5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {tab.label}
              </div>
              {isActive && (
                <div className="self-stretch h-1 bg-[var(--icon-accent-primary)]" />
              )}
            </button>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}
