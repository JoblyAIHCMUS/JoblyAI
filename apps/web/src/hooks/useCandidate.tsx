'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

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
}

const CandidateContext = createContext<CandidateContextType | null>(null);

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    MOCK_CANDIDATES[0] ?? null
  );

  return (
    <CandidateContext.Provider
      value={{
        candidates: MOCK_CANDIDATES,
        selectedCandidate,
        setSelectedCandidate,
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
