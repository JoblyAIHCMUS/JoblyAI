'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getCandidateProfile,
  type CandidateProfileResponse,
} from '@/api-client/candidate';

interface CandidateProfileContextType {
  data: CandidateProfileResponse | null;
  loading: boolean;
  error: unknown;
  fetchCandidateProfile: (options?: {
    onSuccess?: (data: CandidateProfileResponse) => void;
    onError?: (error: unknown) => void;
  }) => Promise<CandidateProfileResponse | null>;
}

const CandidateProfileContext = createContext<
  CandidateProfileContextType | undefined
>(undefined);

export function CandidateProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<CandidateProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchCandidateProfile = useCallback(
    async (options?: {
      onSuccess?: (data: CandidateProfileResponse) => void;
      onError?: (error: unknown) => void;
    }): Promise<CandidateProfileResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await getCandidateProfile();
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
    },
    []
  );

  const value: CandidateProfileContextType = {
    data,
    loading,
    error,
    fetchCandidateProfile,
  };

  return (
    <CandidateProfileContext.Provider value={value}>
      {children}
    </CandidateProfileContext.Provider>
  );
}

export function useCandidateProfileContext() {
  const context = useContext(CandidateProfileContext);
  if (context === undefined) {
    throw new Error(
      'useCandidateProfileContext must be used within CandidateProfileProvider'
    );
  }
  return context;
}
