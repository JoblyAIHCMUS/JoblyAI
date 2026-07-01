import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import { AiProviderService } from './ai-provider.service';
import { ParsedResume } from './resume-parser.service';

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

@Injectable()
export class MatchExplanationService {
  private readonly logger = new Logger(MatchExplanationService.name);

  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly aiProvider: AiProviderService
  ) {}

  async getExplanation(
    applicationId: number,
    scoringMode?: 'exact' | 'embedding'
  ): Promise<MatchExplanation | null> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        matchExplanation: true,
        matchPercentage: true,
        scoringMode: true,
      },
    });

    if (!application?.matchExplanation) {
      return null;
    }

    const explanation =
      application.matchExplanation as unknown as MatchExplanation;

    // Recalculate if overallScore is missing (old explanations)
    if (
      explanation.overallScore === undefined ||
      explanation.overallScore === null
    ) {
      return this.calculateExplanation(applicationId, scoringMode);
    }

    // Force recalculate if requested mode differs from cached mode
    const cachedMode =
      (application.scoringMode as 'exact' | 'embedding') || 'embedding';
    if (scoringMode && scoringMode !== cachedMode) {
      return this.calculateExplanation(applicationId, scoringMode);
    }

    // Fix stale matchPercentage — update if it doesn't match overallScore
    if (application.matchPercentage !== explanation.overallScore) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { matchPercentage: explanation.overallScore },
      });
    }

    return explanation;
  }

  async calculateExplanation(
    applicationId: number,
    scoringMode?: 'exact' | 'embedding'
  ): Promise<MatchExplanation> {
    this.logger.log(
      `Calculating match explanation for application ${applicationId}`
    );

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        jobId: true,
        resumeId: true,
        candidateId: true,
        scoringMode: true,
      },
    });

    if (!application) {
      throw new NotFoundException(`Application ${applicationId} not found`);
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

    // Build full resume text and embed once using Gemini Embedding 2
    const resumeText = parsedResume ? this.buildResumeText(parsedResume) : '';
    const resumeEmbedding = resumeText
      ? await this.aiProvider.generateEmbedding(resumeText)
      : [];

    // Calculate career span years
    const experienceYears = this.calculateCareerSpan(candidateExperience);

    // Per-Requirement Matching — use provided scoringMode, fallback to DB value, then 'embedding'
    const effectiveMode =
      scoringMode ||
      (application.scoringMode as 'exact' | 'embedding') ||
      'embedding';
    const requirementMatches = await this.matchRequirements(
      job.requirements,
      candidateSkills,
      candidateExperience,
      resumeEmbedding,
      parsedResume,
      effectiveMode
    );

    // Calculate overall score (average of all embedding similarities)
    const overallScore = this.calculateOverallScore(requirementMatches);

    // Calculate exact match score (Jaccard-style: met / total)
    const exactMatchScore = this.calculateExactMatchScore(requirementMatches);

    const explanation: MatchExplanation = {
      overallScore,
      exactMatchScore,
      experienceYears,
      requirementMatches,
    };

    // Store in database — also set matchPercentage and scoringMode
    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        matchExplanation: explanation as any,
        matchPercentage: overallScore,
        scoringMode: effectiveMode,
      },
    });

    this.logger.log(
      `Match explanation calculated for application ${applicationId}: overallScore=${overallScore}, ${requirementMatches.length} requirements processed`
    );

    return explanation;
  }

  private isWorkExperience(exp: any): boolean {
    const title = (exp.jobTitle || '').toLowerCase();
    const desc = (exp.description || '').toLowerCase();
    const company = (exp.companyName || '').toLowerCase();
    const combined = `${title} ${desc} ${company}`;

    const educationKeywords = [
      'student',
      'intern',
      'internship',
      'university',
      'college',
      'school',
      'academy',
      'institute',
      'learning',
      'studying',
      'coursework',
      'thesis',
      'capstone',
      'bachelor',
      'master',
      'phd',
      'degree',
      'diploma',
      'certification',
      'training',
      'course',
      'self-taught',
      'freelance',
      'personal project',
      'volunteer',
      'bootcamp',
      'workshop',
      'seminar',
    ];

    return !educationKeywords.some((kw) => combined.includes(kw));
  }

  private calculateCareerSpan(experience: any[]): number {
    const workExp = experience.filter((exp) => this.isWorkExperience(exp));

    if (workExp.length === 0) {
      return 0;
    }

    const now = new Date();
    const earliestStart = Math.min(
      ...workExp.map((e) => new Date(e.startDate).getTime())
    );
    const latestEnd = Math.max(
      ...workExp.map((e) =>
        e.endDate ? new Date(e.endDate).getTime() : now.getTime()
      )
    );

    const totalMonths =
      (latestEnd - earliestStart) / (1000 * 60 * 60 * 24 * 30);
    return Math.round((totalMonths / 12) * 10) / 10;
  }

  private calculateOverallScore(
    requirementMatches: RequirementMatch[]
  ): number {
    if (requirementMatches.length === 0) return 0;

    const totalSimilarity = requirementMatches.reduce(
      (sum, rm) => sum + rm.embeddingSimilarity,
      0
    );
    return (
      Math.round((totalSimilarity / requirementMatches.length) * 10000) / 100
    );
  }

  private calculateExactMatchScore(
    requirementMatches: RequirementMatch[]
  ): number {
    if (requirementMatches.length === 0) return 0;

    const metCount = requirementMatches.filter(
      (rm) => rm.hardConstraintMet
    ).length;
    return Math.round((metCount / requirementMatches.length) * 10000) / 100;
  }

  private async matchRequirements(
    jobRequirements: any[],
    candidateSkills: any[],
    candidateExperience: any[],
    resumeEmbedding: number[],
    parsedResume: ParsedResume | null,
    scoringMode: 'exact' | 'embedding' = 'embedding'
  ): Promise<RequirementMatch[]> {
    // Build resume text for hard constraint checking
    const resumeText = parsedResume ? this.buildResumeText(parsedResume) : '';

    return Promise.all(
      jobRequirements.map(async (jr) => {
        // Hard constraint check: skill name match + years check
        const hardConstraintMet = this.checkHardConstraint(
          jr,
          candidateSkills,
          candidateExperience,
          resumeText,
          scoringMode
        );

        // Embedding similarity
        const embedding = await this.embeddingSkillMatch(jr, resumeEmbedding);

        // Check for exact skill name match
        const exactMatch = this.checkExactSkillMatch(
          jr,
          candidateSkills,
          resumeText
        );

        const status = this.determineStatus(
          hardConstraintMet,
          embedding.similarity,
          exactMatch,
          scoringMode
        );
        const justification = this.generateJustification(
          jr,
          hardConstraintMet,
          embedding,
          exactMatch,
          scoringMode
        );

        return {
          skillName: jr.skill?.name || 'Unknown',
          importance: jr.importance as 'REQUIRED' | 'PREFERRED' | 'OPTIONAL',
          minYearsRequired: jr.minYearsExperience,
          hardConstraintMet,
          embeddingSimilarity: embedding.similarity,
          status,
          justification,
        };
      })
    );
  }

  private buildResumeText(parsedResume: ParsedResume): string {
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

    if (parsedResume.education?.length) {
      const edu = parsedResume.education
        .map(
          (e) => `${e.degree || ''} ${e.fieldOfStudy || ''} from ${e.school}`
        )
        .join(', ');
      parts.push(`Education: ${edu}`);
    }

    return parts.join('\n\n');
  }

  private checkHardConstraint(
    jobReq: any,
    candidateSkills: any[],
    candidateExperience: any[],
    resumeText: string,
    scoringMode: 'exact' | 'embedding' = 'embedding'
  ): boolean {
    const reqSkillName = (jobReq.skill?.name || '').toLowerCase().trim();
    const minYears = jobReq.minYearsExperience || 0;

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
        // Skill found — check years if required
        if (minYears > 0 && matchedSkill.years) {
          return matchedSkill.years >= minYears;
        }
        return true;
      }
    }

    // 2. Check full combined name directly
    const directMatch = candidateSkills.find(
      (s) => s.skill?.name?.toLowerCase().trim() === reqSkillName
    );
    if (directMatch) {
      if (minYears > 0 && directMatch.years) {
        return directMatch.years >= minYears;
      }
      return true;
    }

    // 3. Check experience descriptions (try each part)
    for (const exp of candidateExperience) {
      const text = `${exp.jobTitle || ''} ${
        exp.description || ''
      }`.toLowerCase();
      const matchedPart = reqParts.find((part: string) => {
        // Use word boundary matching to avoid "java" matching "javascript"
        const regex = new RegExp(
          `\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
          'i'
        );
        return regex.test(text);
      });
      if (matchedPart) {
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const years =
          end.getFullYear() -
          start.getFullYear() +
          (end.getMonth() - start.getMonth()) / 12;

        if (minYears > 0) {
          return years >= minYears;
        }
        return true;
      }
    }

    // 4. Check resume text (parsed resume skills section) — both modes
    if (resumeText) {
      const resumeTextLower = resumeText.toLowerCase();
      const matchedPart = reqParts.find((part: string) => {
        return this.skillNameMatchesResumeText(part, resumeTextLower);
      });
      if (matchedPart) {
        // Skill found in resume text — hard constraint met (can't verify years from text, but presence is sufficient)
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a skill name matches text in the resume, handling common variations.
   * e.g., "React" matches "ReactJS", "Node.js" matches "NodeJS", etc.
   */
  private skillNameMatchesResumeText(
    skillName: string,
    resumeTextLower: string
  ): boolean {
    const escaped = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Exact word boundary match
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(resumeTextLower)) return true;

    // 2. Try with common suffixes: react → reactjs, react.js
    const suffixes = ['js', '.js', '.ts', '.net', 'js'];
    for (const suffix of suffixes) {
      if (new RegExp(`\\b${escaped}${suffix}\\b`, 'i').test(resumeTextLower))
        return true;
    }

    // 3. Try stripping suffixes from resume text: reactjs → react
    //    Check if resume contains skill + common tech suffixes
    const resumeVariants = resumeTextLower.replace(/\.js|\.ts|\.net/g, '');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(resumeVariants)) return true;

    return false;
  }

  private checkExactSkillMatch(
    jobReq: any,
    candidateSkills: any[],
    resumeText: string
  ): boolean {
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
      if (matchedSkill) return true;
    }

    // 2. Check full combined name directly
    const directMatch = candidateSkills.find(
      (s) => s.skill?.name?.toLowerCase().trim() === reqSkillName
    );
    if (directMatch) return true;

    // 3. Check resume text
    if (resumeText) {
      const resumeTextLower = resumeText.toLowerCase();
      const matchedPart = reqParts.find((part: string) =>
        this.skillNameMatchesResumeText(part, resumeTextLower)
      );
      if (matchedPart) return true;
    }

    return false;
  }

  private async embeddingSkillMatch(
    jobReq: any,
    resumeEmbedding: number[]
  ): Promise<EmbeddingMatchResult> {
    try {
      if (!resumeEmbedding || resumeEmbedding.length === 0) {
        return {
          similarity: 0,
          matched: false,
          nearestSkill: null,
          explanation: 'No resume embedding available',
        };
      }

      const reqText = `${jobReq.skill?.name || ''} ${jobReq.importance || ''} ${
        jobReq.minYearsExperience
          ? jobReq.minYearsExperience + ' years experience'
          : ''
      }`;
      const reqEmbedding = await this.aiProvider.generateEmbedding(reqText);

      if (!reqEmbedding || reqEmbedding.length === 0) {
        return {
          similarity: 0,
          matched: false,
          nearestSkill: null,
          explanation: 'Could not generate requirement embedding',
        };
      }

      const similarity = this.cosineSimilarity(reqEmbedding, resumeEmbedding);
      const matched = similarity > 0.5;

      return {
        similarity,
        matched,
        nearestSkill: null,
        explanation: matched
          ? `Semantic similarity of ${(similarity * 100).toFixed(
              1
            )}% between requirement and candidate's resume`
          : `Low semantic similarity (${(similarity * 100).toFixed(
              1
            )}%) — requirement doesn't match candidate's profile`,
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

  private determineStatus(
    hardConstraintMet: boolean,
    embeddingSimilarity: number,
    exactMatch: boolean,
    scoringMode: 'exact' | 'embedding'
  ): RequirementMatch['status'] {
    if (scoringMode === 'exact') {
      return hardConstraintMet ? 'strong_match' : 'no_match';
    }
    // Embedding mode
    if (hardConstraintMet) return 'strong_match';
    if (embeddingSimilarity > 0.7 && exactMatch) return 'strong_match';
    if (embeddingSimilarity > 0.5) return 'match';
    if (embeddingSimilarity > 0.3) return 'partial';
    return 'no_match';
  }

  private generateJustification(
    jobReq: any,
    hardConstraintMet: boolean,
    embedding: EmbeddingMatchResult,
    exactMatch: boolean,
    scoringMode: 'exact' | 'embedding'
  ): string {
    const skillName = jobReq.skill?.name || 'this skill';
    const minYears = jobReq.minYearsExperience;

    if (scoringMode === 'exact') {
      if (hardConstraintMet) {
        return minYears
          ? `${skillName} found in candidate's profile with ${minYears}+ years experience.`
          : `${skillName} found in candidate's skills or experience.`;
      }
      return `${skillName} not found in candidate's skills or experience.`;
    }

    // Embedding mode
    if (hardConstraintMet) {
      if (minYears) {
        return `${skillName} hard constraint met — candidate has ${minYears}+ years required.`;
      }
      return `${skillName} hard constraint met — skill is present in candidate's profile.`;
    }

    if (embedding.matched) {
      if (exactMatch && embedding.similarity > 0.7) {
        return `${skillName} — exact skill match with ${(
          embedding.similarity * 100
        ).toFixed(0)}% semantic similarity.`;
      }
      if (embedding.similarity > 0.5) {
        return `${skillName} — semantic match (${(
          embedding.similarity * 100
        ).toFixed(
          0
        )}% similarity) but not an exact skill match. Candidate may have related experience.`;
      }
      return `${skillName} hard constraint not met, but has ${(
        embedding.similarity * 100
      ).toFixed(0)}% semantic similarity. ${embedding.explanation}`;
    }

    return `${skillName} not found in candidate's skills or experience. No strong semantic match detected.`;
  }
}
