"use client";
import { useUser } from '@/hooks/useUser';
import LandingLayout from '@/components/landing/LandingLayout';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();  
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
    );
  }

  if (!user) {
    return <LandingLayout>{children}</LandingLayout>;
  }
  return <>{children}</>;
}
