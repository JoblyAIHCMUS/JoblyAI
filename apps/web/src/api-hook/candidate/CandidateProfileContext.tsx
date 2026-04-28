'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  getCandidateProfile,
  getCandidateProfileById,
  type CandidateProfileResponse,
} from '@/api-client/candidate';

interface CandidateProfileContextType {
  data: CandidateProfileResponse | null;
  loading: boolean;
  error: unknown;
  fetchCandidateProfile: (
    options?: {
      onSuccess?: (data: CandidateProfileResponse) => void;
      onError?: (error: unknown) => void;
    },
    candidateId?: string
  ) => Promise<CandidateProfileResponse | null>;
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
  const lastFetchedIdRef = useRef<string | null>(null);
  const isRequestInFlightRef = useRef(false);

  const fetchCandidateProfile = useCallback(
    async (
      options?: {
        onSuccess?: (data: CandidateProfileResponse) => void;
        onError?: (error: unknown) => void;
      },
      candidateId?: string
    ): Promise<CandidateProfileResponse | null> => {
      // Prevent duplicate requests for the same ID
      if (
        isRequestInFlightRef.current ||
        (candidateId && lastFetchedIdRef.current === candidateId)
      ) {
        return null;
      }

      isRequestInFlightRef.current = true;
      lastFetchedIdRef.current = candidateId || null;
      setLoading(true);
      setError(null);

      try {
        const result = candidateId
          ? await getCandidateProfileById(candidateId)
          : await getCandidateProfile();
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        setError(err);
        options?.onError?.(err);
        return null;
      } finally {
        isRequestInFlightRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  // Memoize context value to prevent unnecessary provider updates
  const value = useMemo<CandidateProfileContextType>(
    () => ({
      data,
      loading,
      error,
      fetchCandidateProfile,
    }),
    [data, loading, error, fetchCandidateProfile]
  );

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
