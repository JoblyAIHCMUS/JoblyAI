'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

// Mock companies - replace with API data later
const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'Nomad', logo: undefined },
  { id: '2', name: 'Acme Inc', logo: undefined },
  { id: '3', name: 'Future Corp', logo: undefined },
];

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    MOCK_COMPANIES[0] ?? null
  );

  return (
    <CompanyContext.Provider
      value={{
        companies: MOCK_COMPANIES,
        selectedCompany,
        setSelectedCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
