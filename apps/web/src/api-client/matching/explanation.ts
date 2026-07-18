import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
  hardConstraintMet: boolean;
  embeddingSimilarity: number;
  status: 'strong_match' | 'match' | 'partial' | 'no_match';
  justification: string;
}

export interface MatchExplanation {
  overallScore: number;
  exactMatchScore: number;
  experienceYears: number;
  requirementMatches: RequirementMatch[];
}

export const getMatchExplanation = async (
  applicationId: string | number,
  scoringMode?: 'exact' | 'embedding'
): Promise<MatchExplanation> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/matching/application/${Number(
      applicationId
    )}/explanation`,
    { params: scoringMode ? { scoringMode } : undefined, withCredentials: true }
  );
  return response.data;
};

export const recalculateMatchExplanation = async (
  applicationId: string | number,
  scoringMode?: 'exact' | 'embedding'
): Promise<MatchExplanation> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/matching/application/${Number(
      applicationId
    )}/recalculate`,
    { scoringMode },
    { withCredentials: true }
  );
  return response.data;
};

export const getJobResumeMatchExplanation = async (
  jobId: number,
  resumeId: number
): Promise<MatchExplanation> => {
  const response = await axios.get(
    `${API_BASE_URL}/api/matching/job/${Number(jobId)}/resume/${Number(
      resumeId
    )}/explanation`,
    { withCredentials: true }
  );
  return response.data;
};
