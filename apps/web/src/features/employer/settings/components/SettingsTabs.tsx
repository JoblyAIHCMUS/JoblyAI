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
      <TabsList className="self-stretch pl-6 bg-bg-primary shadow-[inset_0px_-1px_0px_0px_rgba(214,221,235,1.00)] rounded-none h-auto inline-flex justify-start items-start gap-10 p-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="inline-flex flex-col justify-start items-center gap-2 bg-transparent border-none cursor-pointer p-0 h-auto"
            >
              <div
                className={`justify-center text-base font-medium font-['Lexend_Deca'] leading-5 ${
                  isActive ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {tab.label}
              </div>
              {isActive && (
                <div className="self-stretch h-1 bg-icon-accent-primary" />
              )}
            </button>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}
