import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';

type CompanyCardNavigationProps = {
  role: 'link';
  tabIndex: number;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export function useCompanyNavigation() {
  const router = useRouter();

  const goToCompany = useCallback(
    (companyId: string) => {
      const searchParams = new URLSearchParams();
      searchParams.set('companyId', companyId);
      router.push(`/brown-companies?${searchParams.toString()}`);
    },
    [router]
  );

  const getCompanyCardNavigationProps = useCallback(
    (companyId: string): CompanyCardNavigationProps => ({
      role: 'link',
      tabIndex: 0,
      onClick: () => goToCompany(companyId),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          goToCompany(companyId);
        }
      },
    }),
    [goToCompany]
  );

  return { goToCompany, getCompanyCardNavigationProps };
}
