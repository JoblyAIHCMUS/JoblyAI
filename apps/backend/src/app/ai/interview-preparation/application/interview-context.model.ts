export interface InterviewContext {
  /** Company name from the job posting */
  company: string | null;
  /** Job title / role name */
  role: string | null;
  /** Seniority level inferred from JD (e.g., Junior, Mid, Senior, Lead) */
  level: string | null;
  /** Must-have competencies extracted from JD (5-7 max) */
  mustHaveCompetencies: string[];
  /** Nice-to-have competencies extracted from JD (3-5 max) */
  niceToHaveCompetencies: string[];
  /** 90-day success metrics / KPIs from JD (2-3 bullets) */
  successMetrics: string[];
  /** Skill names extracted from the candidate's parsed resume */
  candidateSkills: string[];
  /** Total years of professional work experience */
  candidateExperienceYears: number;
  /** Key strengths derived from the candidate's resume (title, bio, top skills) */
  candidateStrengths: string[];
  /** Skills required by JD but missing from the candidate's CV */
  gaps: string[];
}
