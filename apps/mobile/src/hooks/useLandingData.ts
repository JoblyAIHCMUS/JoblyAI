import { useCallback, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { useListJobs } from './useListJobs';
import { usePopularCategories } from './usePopularCategories';
import { useTopCompanies } from './useTopCompanies';

export function useLandingData() {
  const featuredData = useListJobs({ pageSize: 4 });
  const latestData = useListJobs({ pageSize: 6 });
  const companiesData = useTopCompanies(6);
  const categoriesData = usePopularCategories(8);
  const refreshFeatured = featuredData.refresh;
  const refreshLatest = latestData.refresh;
  const refreshCompanies = companiesData.refresh;
  const refreshCategories = categoriesData.refresh;

  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const refreshAll = useCallback(async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const results = await Promise.allSettled([
        refreshFeatured(),
        refreshLatest(),
        refreshCompanies(),
        refreshCategories(),
      ]);
      const failed = results.some(
        (result) =>
          result.status === 'rejected' ||
          (result.status === 'fulfilled' && result.value === false)
      );

      if (failed) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      }
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [refreshCategories, refreshCompanies, refreshFeatured, refreshLatest]);

  return {
    featured: featuredData,
    latest: latestData,
    companies: companiesData,
    categories: categoriesData,
    refreshing,
    refreshAll,
  };
}
