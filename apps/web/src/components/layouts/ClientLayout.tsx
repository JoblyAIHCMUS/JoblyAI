'use client';
import { useUser } from '@/hooks/useUser';
import LandingLayout from '@/components/landing/LandingLayout';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import RoleContext from '@/contexts/role-context';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <RoleContext.Provider value="guest">
        <LandingLayout>{children}</LandingLayout>
      </RoleContext.Provider>
    );
  }

  return (
    <RoleContext.Provider value="candidate">
      {children}
    </RoleContext.Provider>
  );
}
