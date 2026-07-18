import { Inject, Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../../ai-provider.service';
import { InterviewContext } from './interview-context.model.js';
import { ParsedResume } from '../../resume-parser.service.js';
import Redis from 'ioredis';

interface JDSignals {
  level: string | null;
  mustHaveCompetencies: string[];
  niceToHaveCompetencies: string[];
  successMetrics: string[];
}

@Injectable()
export class JDAnalysisService {
  private readonly logger = new Logger(JDAnalysisService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) {}

  /**
   * Analyzes JD + Resume to build a structured InterviewContext.
   *
   * 1. Calls Gemini to extract recruitment signals from the JD text.
   * 2. Extracts candidate info from the parsed resume.
   * 3. Performs gap analysis (JD must-haves vs candidate skills).
   */
  async analyze(
    jobId: number,
    jobTitle: string | null,
    companyName: string | null,
    jobDescription: string | null,
    structuredRequirements: { name: string; importance: string }[],
    parsedResume: ParsedResume | null
  ): Promise<InterviewContext> {
    // 1. Extract structured signals from JD via Gemini (or from Cache)
    const jdSignals = await this.extractJDSignals(
      jobId,
      jobTitle,
      companyName,
      jobDescription,
      structuredRequirements
    );

    // 2. Extract candidate information from parsed resume
    const candidateSkills = this.extractCandidateSkills(parsedResume);
    const candidateExperienceYears =
      this.calculateExperienceYears(parsedResume);
    const candidateStrengths = this.extractCandidateStrengths(parsedResume);

    // 3. Gap analysis: must-have competencies not found in candidate skills
    const gaps = this.identifyGaps(
      jdSignals.mustHaveCompetencies,
      candidateSkills
    );

    return {
      company: this.normalize(companyName),
      role: this.normalize(jobTitle),
      level: jdSignals.level,
      mustHaveCompetencies: jdSignals.mustHaveCompetencies,
      niceToHaveCompetencies: jdSignals.niceToHaveCompetencies,
      successMetrics: jdSignals.successMetrics,
      candidateSkills,
      candidateExperienceYears,
      candidateStrengths,
      gaps,
    };
  }

  /**
   * Uses Gemini to extract structured recruitment signals from a JD.
   * Falls back to heuristic extraction if the AI call fails.
   */
  private async extractJDSignals(
    jobId: number,
    jobTitle: string | null,
    companyName: string | null,
    jobDescription: string | null,
    structuredRequirements: { name: string; importance: string }[]
  ): Promise<JDSignals> {
    const cacheKey = `jd_signals:${jobId}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log(`[Redis] Cache hit for JDSignals on Job ${jobId}`);
        return JSON.parse(cached) as JDSignals;
      }
    } catch (cacheErr: any) {
      this.logger.warn(`Failed to read JDSignals from Redis: ${cacheErr.message}`);
    }

    const descriptionText = (jobDescription ?? '').trim();
    const reqText =
      structuredRequirements.length > 0
        ? structuredRequirements
            .map((r) => `- ${r.name} (${r.importance})`)
            .join('\n')
        : 'None provided';

    // If no JD text at all, fall back to structured requirements only
    if (descriptionText.length === 0 && structuredRequirements.length === 0) {
      return {
        level: null,
        mustHaveCompetencies: [],
        niceToHaveCompetencies: [],
        successMetrics: [],
      };
    }

    const prompt = `Analyze the following job posting and extract structured recruitment signals.
Return a JSON object with exactly these fields:
- "level": The seniority level (e.g., "Junior", "Mid-Level", "Senior", "Lead", "Principal"). Infer from context if not explicitly stated. Use null if impossible to determine.
- "mustHaveCompetencies": Array of 5-7 essential technical/professional skills required. Use short, specific terms (e.g., "React", "System Design", "CI/CD"). Do NOT include generic buzzwords like "team player" or "self-starter".
- "niceToHaveCompetencies": Array of 3-5 preferred but non-essential skills.
- "successMetrics": Array of 2-3 concrete 90-day success outcomes or KPIs mentioned or implied by the JD.

Job Title: ${jobTitle ?? 'N/A'}
Company: ${companyName ?? 'N/A'}

Structured Requirements (from database):
${reqText}

Job Description:
${descriptionText.length > 3000 ? descriptionText.slice(0, 3000) + '...' : descriptionText}`;

    try {
      const signals =
        await this.aiProvider.generateStructuredData<JDSignals>(prompt);

      const finalSignals = {
        level: signals.level ?? null,
        mustHaveCompetencies: this.ensureArray(
          signals.mustHaveCompetencies
        ).slice(0, 7),
        niceToHaveCompetencies: this.ensureArray(
          signals.niceToHaveCompetencies
        ).slice(0, 5),
        successMetrics: this.ensureArray(signals.successMetrics).slice(0, 3),
      };

      try {
        await this.redis.set(cacheKey, JSON.stringify(finalSignals), 'EX', 86400); // 24-hour cache
        this.logger.log(`[Redis] Cached JDSignals for Job ${jobId} successfully`);
      } catch (cacheErr: any) {
        this.logger.warn(`Failed to write JDSignals to Redis: ${cacheErr.message}`);
      }

      return finalSignals;
    } catch (error: any) {
      this.logger.warn(
        `Gemini JD extraction failed, falling back to heuristics: ${error.message}`
      );
      return this.fallbackExtraction(structuredRequirements);
    }
  }

  /**
   * Heuristic fallback: uses structured requirements from the database
   * when Gemini extraction fails.
   */
  private fallbackExtraction(
    structuredRequirements: { name: string; importance: string }[]
  ): JDSignals {
    const mustHave = structuredRequirements
      .filter((r) => r.importance === 'REQUIRED')
      .map((r) => r.name)
      .slice(0, 7);

    const niceToHave = structuredRequirements
      .filter((r) => r.importance === 'PREFERRED' || r.importance === 'OPTIONAL')
      .map((r) => r.name)
      .slice(0, 5);

    return {
      level: null,
      mustHaveCompetencies: mustHave,
      niceToHaveCompetencies: niceToHave,
      successMetrics: [],
    };
  }

  private extractCandidateSkills(parsedResume: ParsedResume | null): string[] {
    if (!parsedResume?.skills?.length) return [];
    return parsedResume.skills.map((s) => s.name);
  }

  private calculateExperienceYears(
    parsedResume: ParsedResume | null
  ): number {
    if (!parsedResume?.experience?.length) return 0;

    const now = new Date();
    let earliestStart = now.getTime();
    let latestEnd = 0;

    for (const exp of parsedResume.experience) {
      if (!exp.startDate) continue;
      const start = new Date(exp.startDate).getTime();
      const end = exp.endDate ? new Date(exp.endDate).getTime() : now.getTime();

      if (start < earliestStart) earliestStart = start;
      if (end > latestEnd) latestEnd = end;
    }

    if (latestEnd === 0) return 0;

    const totalMonths =
      (latestEnd - earliestStart) / (1000 * 60 * 60 * 24 * 30);
    return Math.round((totalMonths / 12) * 10) / 10;
  }

  private extractCandidateStrengths(
    parsedResume: ParsedResume | null
  ): string[] {
    if (!parsedResume) return [];

    const strengths: string[] = [];

    if (parsedResume.title) {
      strengths.push(parsedResume.title);
    }

    // Top skills (with highest years or explicit level)
    if (parsedResume.skills?.length) {
      const topSkills = [...parsedResume.skills]
        .sort((a, b) => (b.years ?? 0) - (a.years ?? 0))
        .slice(0, 5)
        .map((s) => {
          const parts = [s.name];
          if (s.years) parts.push(`${s.years}y`);
          if (s.level) parts.push(s.level);
          return parts.join(' ');
        });
      strengths.push(...topSkills);
    }

    return strengths;
  }

  /**
   * Identifies gaps: must-have competencies not matched by candidate skills.
   * Uses case-insensitive partial matching to handle variations like
   * "React" matching "ReactJS" or "React.js".
   */
  private identifyGaps(
    mustHaveCompetencies: string[],
    candidateSkills: string[]
  ): string[] {
    const normalizedSkills = candidateSkills.map((s) =>
      s.toLowerCase().replace(/[.\-_\s]/g, '')
    );

    return mustHaveCompetencies.filter((competency) => {
      const normalizedComp = competency
        .toLowerCase()
        .replace(/[.\-_\s]/g, '');
      return !normalizedSkills.some(
        (skill) =>
          skill.includes(normalizedComp) || normalizedComp.includes(skill)
      );
    });
  }

  private normalize(value?: string | null): string | null {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private ensureArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
  }
}
