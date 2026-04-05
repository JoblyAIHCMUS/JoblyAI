'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getEmployerProfile,
  type EmployerProfileResponse,
} from '@/api-client/employer';

interface EmployerProfileContextType {
  data: EmployerProfileResponse | null;
  loading: boolean;
  error: unknown;
  fetchEmployerProfile: (options?: {
    onSuccess?: (data: EmployerProfileResponse) => void;
    onError?: (error: unknown) => void;
  }) => Promise<EmployerProfileResponse | null>;
}

const EmployerProfileContext = createContext<EmployerProfileContextType | undefined>(undefined);

export function EmployerProfileProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<EmployerProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchEmployerProfile = useCallback(async (options?: {
    onSuccess?: (data: EmployerProfileResponse) => void;
    onError?: (error: unknown) => void;
  }): Promise<EmployerProfileResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEmployerProfile();
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err: unknown) {
      setError(err);
      options?.onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: EmployerProfileContextType = {
    data,
    loading,
    error,
    fetchEmployerProfile,
  };

  return (
    <EmployerProfileContext.Provider value={value}>
      {children}
    </EmployerProfileContext.Provider>
  );
}

export function useEmployerProfileContext() {
  const context = useContext(EmployerProfileContext);
  if (context === undefined) {
    throw new Error('useEmployerProfileContext must be used within EmployerProfileProvider');
  }
  return context;
}
