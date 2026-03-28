import { useState } from 'react';
import { FILTER_GROUPS } from '@/constants/filters';
import { FilterGroupData } from '@/types/job';

export function useFilters() {
  // Use FILTER_GROUPS as the source of truth
  const [filterGroups] = useState<FilterGroupData[]>(FILTER_GROUPS);
  const [checkedMap, setCheckedMap] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    FILTER_GROUPS.forEach((group) => {
      map[group.title] = group.checked || [];
    });
    return map;
  });
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      FILTER_GROUPS.forEach((group) => {
        map[group.title] = true;
      });
      return map;
    }
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
