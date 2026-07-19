'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import { useGetCandidateProfile } from '@/api-hook/candidate/useGetCandidateProfile';
import type { CandidateProfileResponse } from '@/api-client/candidate/types';

export interface Candidate {
  id: string;
  name: string;
  avatar?: string;
}

// Mock candidates - replace with API data later
const MOCK_CANDIDATES: Candidate[] = [];

interface CandidateContextType {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate) => void;
  selectedStartDate: string;
  selectedEndDate: string;
  setSelectedStartDate: (date: string) => void;
  setSelectedEndDate: (date: string) => void;
  candidateProfile: CandidateProfileResponse | null;
  isLoadingProfile: boolean;
}

const CandidateContext = createContext<CandidateContextType | null>(null);

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    MOCK_CANDIDATES[0] ?? null
  );
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const fetchCandidateProfileRef = useRef<any>(null);

  const { fetchCandidateProfile } = useGetCandidateProfile();

  // Keep ref up to date
  fetchCandidateProfileRef.current = fetchCandidateProfile;

  // Fetch candidate profile on mount and listen for profile updates
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const profile = await fetchCandidateProfileRef.current?.();
        setCandidateProfile(profile || null);
      } catch (error) {
        console.error('Failed to load candidate profile:', error);
        setCandidateProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();

    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () =>
      window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  const value = useMemo<CandidateContextType>(
    () => ({
      candidates: MOCK_CANDIDATES,
      selectedCandidate,
      setSelectedCandidate,
      selectedStartDate,
      selectedEndDate,
      setSelectedStartDate,
      setSelectedEndDate,
      candidateProfile,
      isLoadingProfile,
    }),
    [
      selectedCandidate,
      selectedStartDate,
      selectedEndDate,
      candidateProfile,
      isLoadingProfile,
    ]
  );

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidate() {
  const context = useContext(CandidateContext);
  if (!context) {
    throw new Error('useCandidate must be used within a CandidateProvider');
  }
  return context;
}
