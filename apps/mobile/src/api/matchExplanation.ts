import { apiClient } from './config';

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

export async function getMatchExplanation(
  applicationId: string | number
): Promise<MatchExplanation> {
  const response = await apiClient.get<MatchExplanation>(
    `/matching/application/${Number(applicationId)}/explanation`,
    { params: { scoringMode: 'embedding' } }
  );
  return response.data;
}
