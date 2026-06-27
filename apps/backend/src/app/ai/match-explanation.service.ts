import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import { AiProviderService } from './ai-provider.service';
import { ParsedResume } from './resume-parser.service';

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

export interface ScoreBreakdown {
  requirementPercentage: number;
  exactPercentage: number;
  embeddingPercentage: number;
  experienceScore: number;
  formula: string;
  finalScore: number;
}

@Injectable()
export class MatchExplanationService {
  private readonly logger = new Logger(MatchExplanationService.name);

  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly aiProvider: AiProviderService
  ) {}

  async getExplanation(applicationId: number): Promise<MatchExplanation | null> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { matchExplanation: true },
    });

    if (!application?.matchExplanation) {
      return null;
    }

    return application.matchExplanation as unknown as MatchExplanation;
  }

  async calculateExplanation(applicationId: number): Promise<MatchExplanation> {
    this.logger.log(
      `Calculating match explanation for application ${applicationId}`
    );

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, jobId: true, resumeId: true, candidateId: true },
    });

    if (!application) {
      throw new NotFoundException(
        `Application ${applicationId} not found`
      );
    }

    const [job, resume, candidateSkills, candidateExperience] =
      await Promise.all([
        this.prisma.jobPosting.findUnique({
          where: { id: application.jobId },
          include: {
            requirements: { include: { skill: true } },
          },
        }),
        this.prisma.resume.findUnique({
          where: { id: application.resumeId },
          select: { id: true, parsedText: true },
        }),
        this.prisma.candidateSkill.findMany({
          where: { candidateId: application.candidateId },
          include: { skill: true },
        }),
        this.prisma.experience.findMany({
          where: { candidateId: application.candidateId },
          orderBy: { startDate: 'desc' },
        }),
      ]);

    if (!job || !resume) {
      throw new NotFoundException('Job or Resume not found');
    }

    const parsedResume: ParsedResume | null = resume.parsedText
      ? JSON.parse(resume.parsedText as string)
      : null;

    // Phase 1: Experience Tier
    const experienceTier = this.calculateExperienceTier(
      candidateExperience
    );

    // Phase 2: Alignment Matrix
    const jobTier = await this.deriveJobTier(job);
    const alignment = this.calculateAlignment(
      experienceTier.tier,
      jobTier,
      experienceTier.baseScore
    );

    // Phase 3: Quality Boosters (LLM)
    const resumeText = parsedResume
      ? this.buildResumeText(parsedResume, candidateExperience)
      : '';
    const qualityBoosters = await this.calculateQualityBoosters(
      resumeText,
      candidateExperience
    );

    // Phase 4: Per-Requirement Matching
    const requirementMatches = await this.matchRequirements(
      job.requirements,
      candidateSkills,
      candidateExperience
    );

    // Phase 5: Final Scores
    const hybridBreakdown = this.calculateFinalScore(
      alignment,
      qualityBoosters,
      requirementMatches,
      'hybrid'
    );
    const exactBreakdown = this.calculateFinalScore(
      alignment,
      qualityBoosters,
      requirementMatches,
      'exact'
    );
    const embeddingBreakdown = this.calculateFinalScore(
      alignment,
      qualityBoosters,
      requirementMatches,
      'embedding'
    );

    const explanation: MatchExplanation = {
      experienceTier,
      alignment,
      qualityBoosters,
      requirementMatches,
      hybridScore: hybridBreakdown.finalScore,
      exactScore: exactBreakdown.finalScore,
      embeddingScore: embeddingBreakdown.finalScore,
      finalScore: hybridBreakdown.finalScore,
      scoreBreakdown: hybridBreakdown,
    };

    // Store in database
    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        matchExplanation: explanation as any,
        matchPercentage: hybridBreakdown.finalScore,
      },
    });

    this.logger.log(
      `Match explanation calculated for application ${applicationId}: hybrid=${hybridBreakdown.finalScore}, exact=${exactBreakdown.finalScore}, embedding=${embeddingBreakdown.finalScore}`
    );

    return explanation;
  }

  private isWorkExperience(exp: any): boolean {
    const title = (exp.jobTitle || '').toLowerCase();
    const desc = (exp.description || '').toLowerCase();
    const company = (exp.companyName || '').toLowerCase();
    const combined = `${title} ${desc} ${company}`;

    const educationKeywords = [
      'student', 'intern', 'internship', 'university', 'college',
      'school', 'academy', 'institute', 'learning', 'studying',
      'coursework', 'thesis', 'capstone', 'bachelor', 'master',
      'phd', 'degree', 'diploma', 'certification', 'training',
      'course', 'self-taught', 'freelance', 'personal project',
      'volunteer', 'bootcamp', 'workshop', 'seminar',
    ];

    return !educationKeywords.some(kw => combined.includes(kw));
  }

  private calculateExperienceTier(experience: any[]): ExperienceTier {
    const workExp = experience.filter(exp => this.isWorkExperience(exp));

    if (workExp.length === 0) {
      return { totalYears: 0, tier: 1, tierLabel: 'Fresher', baseScore: 40 };
    }

    const now = new Date();
    const earliestStart = Math.min(
      ...workExp.map(e => new Date(e.startDate).getTime())
    );
    const latestEnd = Math.max(
      ...workExp.map(e =>
        e.endDate ? new Date(e.endDate).getTime() : now.getTime()
      )
    );

    const totalMonths =
      (latestEnd - earliestStart) / (1000 * 60 * 60 * 24 * 30);
    const totalYears = totalMonths / 12;

    if (totalYears < 1) {
      return { totalYears, tier: 1, tierLabel: 'Fresher', baseScore: 40 };
    }
    if (totalYears < 3) {
      return { totalYears, tier: 2, tierLabel: 'Junior', baseScore: 65 };
    }
    if (totalYears < 5) {
      return { totalYears, tier: 3, tierLabel: 'Senior', baseScore: 85 };
    }
    if (totalYears < 8) {
      return {
        totalYears,
        tier: 4,
        tierLabel: 'Long-term Senior',
        baseScore: 100,
      };
    }
    return {
      totalYears,
      tier: 5,
      tierLabel: 'Master / Lead',
      baseScore: 110,
    };
  }

  private async deriveJobTier(job: any): Promise<number> {
    const maxYears = Math.max(
      ...job.requirements.map((r: any) => r.minYearsExperience ?? 0),
      0
    );

    const yearsTier =
      maxYears < 1 ? 1 : maxYears < 3 ? 2 : maxYears < 5 ? 3 : maxYears < 8 ? 4 : 5;

    const requirementsText = job.requirements
      .map((r: any) => `- ${r.skill?.name || 'Unknown'} (${r.importance}, ${r.minYearsExperience || 0} years required)`)
      .join('\n');

    try {
      const aiResult = await this.aiProvider.generateStructuredData<{
        tier: number;
        reasoning: string;
      }>(
        `Classify this job posting into an experience tier. Consider the job TITLE, DESCRIPTION, and REQUIREMENTS together — not just years of experience.

TIER DEFINITIONS:
1 = Entry-level / Fresher / Associate Consultant / Intern
   - Recent graduates, no prior work expected
   - Titles: Intern, Fresher, Trainee, Associate, Junior Consultant

2 = Junior / Early Career
   - 1-2 years experience, basic skills needed
   - Titles: Junior Developer, Associate Engineer

3 = Mid-level / Senior
   - 3-5 years, solid expertise expected
   - Titles: Senior Developer, Team Lead, Architect

4 = Senior / Staff
   - 5-8 years, deep expertise and leadership
   - Titles: Staff Engineer, Principal, Director

5 = Principal / Lead / VP
   - 8+ years, strategic leadership
   - Titles: VP Engineering, CTO, Principal Architect

JOB POSTING:
Title: ${job.title}
Description: ${job.description?.substring(0, 800) || 'N/A'}

REQUIREMENTS:
${requirementsText}

IMPORTANT: An "Associate Consultant" is ENTRY-LEVEL (tier 1), not junior. Years of experience in requirements (e.g., "2 years") does NOT automatically make it tier 2 — consider the role's seniority level.

Return JSON: { "tier": number (1-5), "reasoning": "brief explanation" }`
      );

      if (aiResult?.tier >= 1 && aiResult.tier <= 5) {
        this.logger.log(`AI tier classification: ${aiResult.tier} (${aiResult.reasoning})`);
        return aiResult.tier;
      }
    } catch (error: any) {
      this.logger.warn(
        `AI tier classification failed, falling back to years-based: ${error.message}`
      );
    }

    return yearsTier;
  }

  private calculateAlignment(
    candidateTier: number,
    jobTier: number,
    baseScore: number
  ): AlignmentResult {
    const distance = candidateTier - jobTier;

    let multiplier: number;
    if (distance === 0) {
      multiplier = 1.0;
    } else if (distance === -1) {
      multiplier = 0.85;
    } else if (distance <= -2) {
      multiplier = 0.3;
    } else if (distance === 1) {
      multiplier = 1.0;
    } else if (distance === 2) {
      multiplier = 0.7;
    } else {
      multiplier = 0.4;
    }

    return { jobTier, candidateTier, distance, multiplier, adjustedBase: Math.round(baseScore * multiplier) };
  }

  private async calculateQualityBoosters(
    resumeText: string,
    experience: any[]
  ): Promise<QualityBoosters> {
    if (!resumeText || resumeText.length < 100) {
      return {
        projectType: 0,
        scale: 0,
        leadership: 0,
        total: 0,
        breakdown: ['Insufficient resume data for quality analysis'],
      };
    }

    try {
      const result = await this.aiProvider.generateStructuredData<{
        projectType: { score: number; evidence: string };
        scale: { score: number; evidence: string };
        leadership: { score: number; evidence: string };
      }>(
        `Analyze this resume and evaluate quality boosters.

Resume:
${resumeText.substring(0, 3000)}

Evaluate these three categories. For each, provide a score AND the specific evidence from the resume:

1. Project Type & Environment (0-20 points):
   - Enterprise/Industrial Systems: +10 (CI/CD, corporate codebases, compliance, testing frameworks)
   - Personal/Indie Projects: +5 (passion, self-starting, side projects)
   - Both: +15

2. Scale & User Base (0-15 points):
   - High Traffic/Large User Base: +10 (10k+ users, high transactions, production apps)
   - Complex System Architecture: +5 (microservices, multi-region, distributed systems, event-driven)

3. Leadership & Autonomy (0-15 points):
   - Direct Management: +15 (managed team, performance reviews, hiring)
   - Informal Mentorship/Lead: +10 (led projects, mentored juniors, tech lead)
   - Sole Contributor: +5 (built full-stack project alone from scratch to production)

Return JSON:
{
  "projectType": { "score": number (0-20), "evidence": "quote from resume" },
  "scale": { "score": number (0-15), "evidence": "quote from resume" },
  "leadership": { "score": number (0-15), "evidence": "quote from resume" }
}`
      );

      const projectType = Math.min(20, Math.max(0, result.projectType?.score ?? 0));
      const scale = Math.min(15, Math.max(0, result.scale?.score ?? 0));
      const leadership = Math.min(15, Math.max(0, result.leadership?.score ?? 0));

      return {
        projectType,
        scale,
        leadership,
        total: projectType + scale + leadership,
        breakdown: [
          `Project type (${projectType}/20): ${result.projectType?.evidence || 'N/A'}`,
          `Scale (${scale}/15): ${result.scale?.evidence || 'N/A'}`,
          `Leadership (${leadership}/15): ${result.leadership?.evidence || 'N/A'}`,
        ],
      };
    } catch (error: any) {
      this.logger.warn(`Quality boosters LLM failed: ${error.message}`);
      return {
        projectType: 0,
        scale: 0,
        leadership: 0,
        total: 0,
        breakdown: ['Quality analysis unavailable'],
      };
    }
  }

  private async matchRequirements(
    jobRequirements: any[],
    candidateSkills: any[],
    candidateExperience: any[]
  ): Promise<RequirementMatch[]> {
    return Promise.all(
      jobRequirements.map(async (jr) => {
        const exact = this.exactSkillMatch(
          jr,
          candidateSkills,
          candidateExperience
        );

        // Compute embedding match using targeted skill comparison
        let embedding: EmbeddingMatchResult | null = null;
        embedding = await this.embeddingSkillMatch(jr, [], candidateSkills);

        const importanceWeight = this.getImportanceWeight(jr.importance);

        // Compute both scores independently
        const exactRawScore = exact.found
          ? this.scoreExactMatch(jr, exact)
          : 0;
        const embeddingRawScore = embedding?.matched
          ? embedding.similarity * 100
          : 0;

        // Primary score used for status/justification (exact preferred)
        const rawScore = exact.found ? exactRawScore : embeddingRawScore;

        const score = rawScore * importanceWeight;
        const exactScore = exactRawScore * importanceWeight;
        const embeddingScore = embeddingRawScore * importanceWeight;
        const status = this.determineStatus(rawScore);
        const justification = this.generateJustification(
          jr,
          exact,
          embedding,
          rawScore
        );

        return {
          skillName: jr.skill?.name || 'Unknown',
          importance: jr.importance as 'REQUIRED' | 'PREFERRED' | 'OPTIONAL',
          minYearsRequired: jr.minYearsExperience,
          exactMatch: exact,
          embeddingMatch: embedding,
          score,
          exactScore,
          embeddingScore,
          status,
          justification,
        };
      })
    );
  }

  private exactSkillMatch(
    jobReq: any,
    candidateSkills: any[],
    candidateExperience: any[]
  ): ExactMatchResult {
    const reqSkillName = (jobReq.skill?.name || '').toLowerCase().trim();

    // Split "JavaScript/TypeScript" → ["javascript", "typescript"]
    const reqParts = reqSkillName.includes('/')
      ? reqSkillName.split('/').map((s: string) => s.trim())
      : [reqSkillName];

    // 1. Check each part against candidate skills
    for (const part of reqParts) {
      const matchedSkill = candidateSkills.find(
        (s) => s.skill?.name?.toLowerCase().trim() === part
      );
      if (matchedSkill) {
        return {
          found: true,
          candidateYears: matchedSkill.years,
          candidateLevel: matchedSkill.level,
          matchedFrom: 'skill',
        };
      }
    }

    // 2. Check full combined name directly
    const directMatch = candidateSkills.find(
      (s) => s.skill?.name?.toLowerCase().trim() === reqSkillName
    );
    if (directMatch) {
      return {
        found: true,
        candidateYears: directMatch.years,
        candidateLevel: directMatch.level,
        matchedFrom: 'skill',
      };
    }

    // 3. Check experience descriptions (try each part)
    for (const exp of candidateExperience) {
      const text = `${exp.jobTitle || ''} ${exp.description || ''}`.toLowerCase();
      const matchedPart = reqParts.find((part: string) => text.includes(part));
      if (matchedPart) {
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const years =
          (end.getFullYear() - start.getFullYear()) +
          (end.getMonth() - start.getMonth()) / 12;

        return {
          found: true,
          candidateYears: Math.round(years * 10) / 10,
          candidateLevel: null,
          matchedFrom: 'experience',
        };
      }
    }

    return { found: false, candidateYears: null, candidateLevel: null, matchedFrom: null };
  }

  private getImportanceWeight(importance: string): number {
    switch (importance) {
      case 'REQUIRED':
        return 3;
      case 'PREFERRED':
        return 2;
      case 'OPTIONAL':
        return 1;
      default:
        return 1;
    }
  }

  private scoreExactMatch(jobReq: any, exact: ExactMatchResult): number {
    if (!exact.found) return 0;

    const minYears = jobReq.minYearsExperience || 0;
    const candidateYears = exact.candidateYears || 0;

    if (minYears === 0) return 60;

    if (candidateYears >= minYears * 2) return 95;
    if (candidateYears >= minYears * 1.5) return 85;
    if (candidateYears >= minYears) return 75;
    if (candidateYears >= minYears * 0.75) return 55;
    if (candidateYears >= minYears * 0.5) return 35;
    return 15;
  }

  private async embeddingSkillMatch(
    jobReq: any,
    skillsEmbedding: number[],
    candidateSkills: any[]
  ): Promise<EmbeddingMatchResult> {
    try {
      const reqSkillName = (jobReq.skill?.name || '').toLowerCase().trim();

      // Find candidate skill matching by name (handle combined names like "JavaScript/TypeScript")
      const reqParts = reqSkillName.includes('/')
        ? reqSkillName.split('/').map((s: string) => s.trim())
        : [reqSkillName];

      let matchedCandidateSkill: any = null;
      for (const part of reqParts) {
        const found = candidateSkills.find(
          (s) => s.skill?.name?.toLowerCase().trim() === part
        );
        if (found) {
          matchedCandidateSkill = found;
          break;
        }
      }

      // Build short targeted text for embedding
      let skillText: string;
      if (matchedCandidateSkill) {
        // Short focused text: "Node.js 5 years Expert"
        const parts = [matchedCandidateSkill.skill?.name || reqSkillName];
        if (matchedCandidateSkill.years) parts.push(`${matchedCandidateSkill.years} years`);
        if (matchedCandidateSkill.level) parts.push(matchedCandidateSkill.level);
        skillText = parts.join(' ');
      } else {
        // No matching skill found — use requirement text for fallback comparison
        skillText = reqSkillName;
      }

      // Also embed the requirement text for comparison
      const reqText = `${jobReq.skill?.name || ''} ${jobReq.importance || ''} ${jobReq.minYearsExperience ? jobReq.minYearsExperience + ' years experience' : ''}`;
      const [skillEmbedding, reqEmbedding] = await Promise.all([
        this.aiProvider.generateEmbedding(skillText),
        this.aiProvider.generateEmbedding(reqText),
      ]);

      if (!skillEmbedding || skillEmbedding.length === 0 || !reqEmbedding || reqEmbedding.length === 0) {
        return {
          similarity: 0,
          matched: false,
          nearestSkill: null,
          explanation: 'Could not generate embeddings for comparison',
        };
      }

      const similarity = this.cosineSimilarity(skillEmbedding, reqEmbedding);
      const matched = similarity > 0.5;

      return {
        similarity,
        matched,
        nearestSkill: matchedCandidateSkill?.skill?.name || null,
        explanation: matched
          ? `Semantic similarity of ${(similarity * 100).toFixed(1)}% between candidate's ${matchedCandidateSkill?.skill?.name || 'skill'} and job requirement`
          : `Low semantic similarity (${(similarity * 100).toFixed(1)}%) — candidate's skill profile doesn't strongly match this requirement`,
      };
    } catch (error: any) {
      this.logger.warn(
        `Embedding match failed for ${jobReq.skill?.name}: ${error.message}`
      );
      return {
        similarity: 0,
        matched: false,
        nearestSkill: null,
        explanation: 'Embedding comparison unavailable',
      };
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  private determineStatus(rawScore: number): RequirementMatch['status'] {
    if (rawScore >= 80) return 'strong_match';
    if (rawScore >= 60) return 'match';
    if (rawScore >= 30) return 'partial';
    return 'no_match';
  }

  private generateJustification(
    jobReq: any,
    exact: ExactMatchResult,
    embedding: EmbeddingMatchResult | null,
    rawScore: number
  ): string {
    const skillName = jobReq.skill?.name || 'this skill';
    const minYears = jobReq.minYearsExperience;

    if (exact.found) {
      const yearsText = exact.candidateYears
        ? `${exact.candidateYears} year(s)`
        : 'some';
      const levelText = exact.candidateLevel
        ? ` at ${exact.candidateLevel} level`
        : '';
      const matchSource =
        exact.matchedFrom === 'skill'
          ? `Candidate has ${yearsText} of ${skillName} experience${levelText} in their skills profile`
          : `Found ${skillName} mentioned in candidate's work experience (${yearsText})`;

      if (minYears && exact.candidateYears) {
        if (exact.candidateYears >= minYears * 2) {
          return `${matchSource}. Significantly exceeds the ${minYears}-year requirement (${exact.candidateYears}x).`;
        }
        if (exact.candidateYears >= minYears) {
          return `${matchSource}. Meets the ${minYears}-year requirement.`;
        }
        return `${matchSource}. Below the ${minYears}-year requirement but skill is present.`;
      }
      return `${matchSource}. Skill requirement met.`;
    }

    if (embedding?.matched) {
      return `${skillName} not found as exact match, but resume has ${(embedding.similarity * 100).toFixed(0)}% semantic similarity to this requirement. ${embedding.explanation}`;
    }

    return `${skillName} not found in candidate's skills or experience. No strong semantic match detected.`;
  }

  private calculateFinalScore(
    alignment: AlignmentResult,
    qualityBoosters: QualityBoosters,
    requirementMatches: RequirementMatch[],
    mode: 'hybrid' | 'exact' | 'embedding'
  ): ScoreBreakdown {
    const experienceScore = alignment.adjustedBase + qualityBoosters.total;

    // Unified denominator: ALL requirements always contribute
    const totalMaxScore = requirementMatches.reduce((sum, rm) => {
      const weight = this.getImportanceWeight(rm.importance);
      return sum + 100 * weight;
    }, 0);

    // Exact percentage: sum of exactScore / max for ALL requirements
    const exactTotal = requirementMatches.reduce(
      (sum, rm) => sum + rm.exactScore,
      0
    );
    const exactPercentage =
      totalMaxScore > 0 ? (exactTotal / totalMaxScore) * 100 : 0;

    // Embedding percentage: sum of embeddingScore / max for ALL requirements
    const embeddingTotal = requirementMatches.reduce(
      (sum, rm) => sum + rm.embeddingScore,
      0
    );
    const embeddingPercentage =
      totalMaxScore > 0 ? (embeddingTotal / totalMaxScore) * 100 : 0;

    // Calculate combined requirement percentage based on mode
    let requirementPercentage: number;
    switch (mode) {
      case 'exact':
        requirementPercentage = exactPercentage;
        break;
      case 'embedding':
        requirementPercentage = embeddingPercentage;
        break;
      case 'hybrid':
      default:
        // 30% exact match + 70% embedding match
        requirementPercentage = exactPercentage * 0.3 + embeddingPercentage * 0.7;
        break;
    }

    const finalScore = Math.round(
      requirementPercentage * 0.6 + experienceScore * 0.4
    );

    return {
      requirementPercentage: Math.round(requirementPercentage * 10) / 10,
      exactPercentage: Math.round(exactPercentage * 10) / 10,
      embeddingPercentage: Math.round(embeddingPercentage * 10) / 10,
      experienceScore: Math.round(experienceScore * 10) / 10,
      formula: `Final = RequirementScore(${Math.round(requirementPercentage)}) × 0.6 + ExperienceScore(${Math.round(experienceScore)}) × 0.4 = ${Math.min(100, Math.max(0, finalScore))}`,
      finalScore: Math.min(100, Math.max(0, finalScore)),
    };
  }

  private buildResumeText(
    parsedResume: ParsedResume,
    experience: any[]
  ): string {
    const parts: string[] = [];

    if (parsedResume.title) parts.push(`Title: ${parsedResume.title}`);
    if (parsedResume.bio) parts.push(`Summary: ${parsedResume.bio}`);

    if (parsedResume.skills?.length) {
      const skills = parsedResume.skills
        .map((s) => {
          const parts = [s.name];
          if (s.years) parts.push(`${s.years} years`);
          if (s.level) parts.push(s.level);
          return parts.join(' - ');
        })
        .join(', ');
      parts.push(`Skills: ${skills}`);
    }

    if (experience?.length) {
      const expText = experience
        .map(
          (e) =>
            `${e.jobTitle} at ${e.companyName} (${e.startDate?.getFullYear() || 'N/A'} - ${e.endDate?.getFullYear() || 'Present'}): ${e.description || 'No description'}`
        )
        .join('\n');
      parts.push(`Experience:\n${expText}`);
    }

    if (parsedResume.education?.length) {
      const edu = parsedResume.education
        .map(
          (e) =>
            `${e.degree || ''} ${e.fieldOfStudy || ''} from ${e.school}`
        )
        .join(', ');
      parts.push(`Education: ${edu}`);
    }

    return parts.join('\n\n');
  }
}
