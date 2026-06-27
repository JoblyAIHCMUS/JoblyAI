import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ExperienceTier {
  totalYears: number;
  tier: 1 | 2 | 3 | 4 | 5;
  tierLabel: string;
  baseScore: number;
}

export interface AlignmentResult {
  jobTier: number;
  candidateTier: number;
  distance: number;
  multiplier: number;
  adjustedBase: number;
}

export interface QualityBoosters {
  projectType: number;
  scale: number;
  leadership: number;
  total: number;
  breakdown: string[];
}

export interface ExactMatchResult {
  found: boolean;
  candidateYears: number | null;
  candidateLevel: string | null;
  matchedFrom: 'skill' | 'experience' | null;
}

export interface EmbeddingMatchResult {
  similarity: number;
  matched: boolean;
  nearestSkill: string | null;
  explanation: string;
}

export interface RequirementMatch {
  skillName: string;
  importance: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
  minYearsRequired: number | null;
  exactMatch: ExactMatchResult;
  embeddingMatch: EmbeddingMatchResult | null;
  score: number;
  exactScore: number;
  embeddingScore: number;
  status: 'strong_match' | 'match' | 'partial' | 'no_match';
  justification: string;
}

export interface ScoreBreakdown {
  requirementPercentage: number;
  exactPercentage: number;
  embeddingPercentage: number;
  experienceScore: number;
  formula: string;
  finalScore: number;
}

export interface MatchExplanation {
  experienceTier: ExperienceTier;
  alignment: AlignmentResult;
  qualityBoosters: QualityBoosters;
  requirementMatches: RequirementMatch[];
  hybridScore: number;
  exactScore: number;
  embeddingScore: number;
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
}

export const getMatchExplanation = async (
  applicationId: string | number
): Promise<MatchExplanation> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/matching/application/${Number(
      applicationId
    )}/explanation`,
    { withCredentials: true }
  );
  return response.data;
};

export const recalculateMatchExplanation = async (
  applicationId: string | number
): Promise<MatchExplanation> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/matching/application/${Number(
      applicationId
    )}/recalculate`,
    {},
    { withCredentials: true }
  );
  return response.data;
};
