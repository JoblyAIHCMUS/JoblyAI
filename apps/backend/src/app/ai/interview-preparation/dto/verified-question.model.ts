export interface VerifiedQuestion {
  question: string;
  evidenceCount: number;
  evidenceLevel: EvidenceLevel;
  sources: string[];
  contexts: string[];
}

export type EvidenceLevel = 'low' | 'moderate' | 'high' | 'very_high';