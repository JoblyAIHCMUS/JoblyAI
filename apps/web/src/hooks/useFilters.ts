import { useState } from 'react';
import { jobService } from '@/services/jobService';

export function useFilters() {
  const filterGroups = jobService.getFilters();

  const [checkedMap, setCheckedMap] = useState<Record<string, string[]>>(() =>
    filterGroups.reduce<Record<string, string[]>>((acc, group) => {
      acc[group.title] = group.checked;
      return acc;
    }, {})
  );

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() =>
    filterGroups.reduce<Record<string, boolean>>((acc, group) => {
      acc[group.title] = true;
      return acc;
    }, {})
  );

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleToggle = (groupTitle: string, itemLabel: string) => {
    setCheckedMap((prev) => {
      const current = prev[groupTitle] ?? [];
      const next = current.includes(itemLabel)
        ? current.filter((label) => label !== itemLabel)
        : [...current, itemLabel];

      return {
        ...prev,
        [groupTitle]: next,
      };
    });
  };

  const handleToggleExpand = (groupTitle: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const handleApplyMobileFilters = () => {
    setIsMobileFiltersOpen(false);
  };

  return {
    filterGroups,
    checkedMap,
    expandedMap,
    isMobileFiltersOpen,
    setIsMobileFiltersOpen,
    handleToggle,
    handleToggleExpand,
    handleApplyMobileFilters,
  };
}
