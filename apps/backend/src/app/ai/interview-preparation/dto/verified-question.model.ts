export interface VerifiedQuestion {
  question: string;
  evidenceCount: number;
  confidence: number;
  sources: string[];
  contexts: string[];
}