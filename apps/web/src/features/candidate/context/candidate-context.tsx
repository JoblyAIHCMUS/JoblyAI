'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { toDateInputValue } from '@/lib/candidateDate';

export interface Candidate {
  id: string;
  name: string;
  avatar?: string;
}

// Mock candidates - replace with API data later
const MOCK_CANDIDATES: Candidate[] = [
  { id: '1', name: 'Jake Gyll', avatar: undefined },
  { id: '2', name: 'Maria Garcia', avatar: undefined },
  { id: '3', name: 'John Smith', avatar: undefined },
];

interface CandidateContextType {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate) => void;
  selectedStartDate: string;
  selectedEndDate: string;
  setSelectedStartDate: (date: string) => void;
  setSelectedEndDate: (date: string) => void;
}

const CandidateContext = createContext<CandidateContextType | null>(null);

function getInitialWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);

  return {
    startDate: toDateInputValue(start),
    endDate: toDateInputValue(end),
  };
}

export function CandidateProvider({ children }: { children: ReactNode }) {
  const initialRange = getInitialWeekRange();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    MOCK_CANDIDATES[0] ?? null
  );
  const [selectedStartDate, setSelectedStartDate] = useState(
    initialRange.startDate
  );
  const [selectedEndDate, setSelectedEndDate] = useState(initialRange.endDate);

  return (
    <CandidateContext.Provider
      value={{
        candidates: MOCK_CANDIDATES,
        selectedCandidate,
        setSelectedCandidate,
        selectedStartDate,
        selectedEndDate,
        setSelectedStartDate,
        setSelectedEndDate,
      }}
    >
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
