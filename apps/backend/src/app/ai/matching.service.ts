import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import { GetJobsQueryDTO } from '../jobs/dto/getJobsQueryDTO';
import { MatchExplanationService } from './match-explanation.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  // Vietnamese accent mapping for manual unaccenting in SQL
  private readonly VN_ACCENTS_SEARCH =
    'áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ';
  private readonly VN_ACCENTS_REPLACE =
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD';

  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly matchExplanationService: MatchExplanationService
  ) {}

  /**
   * Calculates the semantic match percentage between a resume and a job posting
   */
  async calculateMatchPercentage(
    resumeId: number,
    jobId: number
  ): Promise<number | null> {
    try {
      const result: any[] = await this.prisma.$queryRawUnsafe(
        `
        SELECT 1 - (r.embedding <=> j.embedding) as similarity
        FROM "resume" r
        JOIN "JobPosting" j ON j.id = $2
        WHERE r.id = $1
          AND r.embedding IS NOT NULL 
          AND j.embedding IS NOT NULL
      `,
        resumeId,
        jobId
      );

      if (result && result.length > 0 && result[0].similarity !== null) {
        return parseFloat((Math.max(0, result[0].similarity) * 100).toFixed(2));
      }
      return null;
    } catch (error: any) {
      this.logger.error(
        `Failed to calculate match percentage for resume ${resumeId} and job ${jobId}`,
        error.stack
      );
      return null;
    }
  }

  /**
   * Helper to wrap a SQL expression with Vietnamese unaccenting logic
   */
  private wrapUnaccent(expression: string): string {
    return `translate(${expression}, '${this.VN_ACCENTS_SEARCH}', '${this.VN_ACCENTS_REPLACE}')`;
  }

  /**
   * Finds jobs that match a specific resume using vector similarity, with filters.
   * The match score is the embedding-based per-requirement score from
   * MatchExplanationService (mean cosine similarity of requirement skill
   * embeddings against the candidate's best skill embedding), calculated lazily
   * for the current page only. Falls back to the pgvector cosine distance when
   * the resume or job cannot be scored that way. The page is re-sorted: scored
   * jobs first, then by score desc.
   */
  async findJobsForResume(resumeId: number, query: GetJobsQueryDTO) {
    const limit = query.pageSize || 10;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    this.logger.log(
      `Finding filtered job recommendations for resume ID: ${resumeId}`
    );

    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      select: { id: true },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${resumeId} not found`);
    }

    const resumeWithVector: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT embedding FROM "resume" WHERE id = $1`,
      resumeId
    );

    if (!resumeWithVector.length || !resumeWithVector[0].embedding) {
      this.logger.warn(
        `Resume ${resumeId} has no embedding. Recommendations cannot be generated.`
      );
      return { jobs: [], total: 0, page, pageSize: limit, totalPages: 0 };
    }

    const vectorStr = resumeWithVector[0].embedding;

    // Build dynamic WHERE clause for raw SQL
    let whereClause = `status = 'OPEN' AND "deletedAt" IS NULL AND embedding IS NOT NULL`;
    const params: any[] = [vectorStr, limit, offset];
    let paramIndex = 4;

    if (query.q) {
      // Apply unaccenting to both q and the title/description
      const unaccentQ = this.wrapUnaccent(`$${paramIndex}`);
      whereClause += ` AND (${this.wrapUnaccent(
        'title'
      )} ILIKE ${unaccentQ} OR ${this.wrapUnaccent(
        'description'
      )} ILIKE ${unaccentQ})`;
      params.push(`%${query.q}%`);
      paramIndex++;
    }

    if (query.location) {
      // Apply manual unaccenting to location search
      const unaccentLocation = this.wrapUnaccent(`$${paramIndex}`);
      whereClause += ` AND ${this.wrapUnaccent(
        'location'
      )} ILIKE ${unaccentLocation}`;
      params.push(`%${query.location}%`);
      paramIndex++;
    }

    if (query.salaryMin) {
      whereClause += ` AND "salaryMin" >= $${paramIndex}`;
      params.push(query.salaryMin);
      paramIndex++;
    }

    if (query.salaryMax) {
      whereClause += ` AND "salaryMax" <= $${paramIndex}`;
      params.push(query.salaryMax);
      paramIndex++;
    }

    if (query.categories && query.categories.length > 0) {
      whereClause += ` AND "categoryId" = ANY($${paramIndex})`;
      params.push(query.categories);
      paramIndex++;
    }

    if (query.type && query.type.length > 0) {
      whereClause += ` AND type = ANY($${paramIndex}::"EmploymentType"[])`;
      params.push(query.type);
      paramIndex++;
    }

    // Sort: respect query.sort; default is MOST_RELEVANT (pgvector distance).
    let orderBy = `distance ASC`;
    switch (query.sort) {
      case 'NEWEST':
        orderBy = `"createdAt" DESC`;
        break;
      case 'OLDEST':
        orderBy = `"createdAt" ASC`;
        break;
      case 'SALARY_ASC':
        orderBy = `"salaryMin" ASC NULLS LAST`;
        break;
      case 'SALARY_DESC':
        orderBy = `"salaryMax" DESC NULLS LAST`;
        break;
      case 'MOST_RELEVANT':
      default:
        orderBy = `distance ASC`;
        break;
    }

    if (query.location) {
      const locationParamIndex =
        params.findIndex(
          (p) =>
            typeof p === 'string' &&
            query.location &&
            p.includes(query.location)
        ) + 1;
      if (locationParamIndex > 0) {
        // Prioritize exact/partial location matches (case-insensitive + unaccented)
        // on top of the chosen sort.
        const unaccentLocationSort = this.wrapUnaccent(
          `$${locationParamIndex}`
        );
        orderBy = `(CASE WHEN ${this.wrapUnaccent(
          'location'
        )} ILIKE ${unaccentLocationSort} THEN 0 ELSE 1 END), ${orderBy}`;
      }
    }

    switch (query.sort) {
      case 'NEWEST':
        orderBy = `"createdAt" DESC`;
        break;
      case 'OLDEST':
        orderBy = `"createdAt" ASC`;
        break;
      case 'SALARY_ASC':
        orderBy = `"salaryMin" ASC`;
        break;
      case 'SALARY_DESC':
        orderBy = `"salaryMax" DESC`;
        break;
      case 'MOST_RELEVANT':
      default:
        // keep pgvector orderBy (with location-priority if applicable)
        break;
    }

    const matchedJobs: any[] = await this.prisma.$queryRawUnsafe(
      `
      SELECT id, (embedding <=> $1::vector) as distance, "createdAt", "salaryMin", "salaryMax", count(*) OVER() AS full_count
      FROM "JobPosting"
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
      `,
      ...params
    );

    if (matchedJobs.length === 0) {
      return { jobs: [], total: 0, page, pageSize: limit, totalPages: 0 };
    }

    const total = parseInt(matchedJobs[0].full_count, 10);
    const totalPages = Math.ceil(total / limit);
    const jobIds = matchedJobs.map((j) => j.id);

    const jobs = await this.prisma.jobPosting.findMany({
      where: {
        id: { in: jobIds },
      },
      include: {
        category: true,
        company: true,
        requirements: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    const sortedJobs = matchedJobs
      .map((mj) => {
        const jobDetail = jobs.find((j) => j.id === mj.id);
        if (!jobDetail) return null;

        return this.mapToJobResponse(jobDetail);
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    let newScores: Map<
      number,
      { overallScore: number; exactMatchScore: number; scored: boolean }
    > = new Map();
    try {
      newScores = await this.matchExplanationService.scoreResumeAgainstJobs(
        resumeId,
        jobIds
      );
    } catch (error: any) {
      this.logger.warn(
        `Failed to compute explanation scores for resume ${resumeId}, falling back to pgvector: ${error.message}`
      );
    }

    for (const item of sortedJobs) {
      const scored = newScores.get(item.job.id);
      if (scored?.scored) {
        item.matchPercentage = scored.overallScore;
        item.scored = true;
      }
    }

    sortedJobs.sort((a, b) => {
      if (a.scored !== b.scored) {
        return a.scored ? -1 : 1;
      }
      return b.matchPercentage - a.matchPercentage;
    });

    return {
      jobs: sortedJobs.map((item) => ({
        ...item.job,
        matchPercentage: item.matchPercentage,
      })),
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  }

  /**
   * Calculates and updates the match percentage for a specific application
   */
  async calculateApplicationScore(
    applicationId: number
  ): Promise<number | null> {
    this.logger.log(
      `Calculating percentage for application ID: ${applicationId}`
    );

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, jobId: true, resumeId: true },
    });

    if (!application) {
      this.logger.warn(
        `Application ${applicationId} not found for percentage calculation`
      );
      return null;
    }

    // Check if both have embeddings first for better logging
    const [job, resume] = await Promise.all([
      this.prisma.$queryRawUnsafe(
        `SELECT id, (embedding IS NOT NULL) as "hasEmbedding" FROM "JobPosting" WHERE id = $1`,
        application.jobId
      ),
      this.prisma.$queryRawUnsafe(
        `SELECT id, (embedding IS NOT NULL) as "hasEmbedding" FROM "resume" WHERE id = $1`,
        application.resumeId
      ),
    ]);

    const jobHasEmbedding = (job as any[])?.[0]?.hasEmbedding;
    const resumeHasEmbedding = (resume as any[])?.[0]?.hasEmbedding;

    if (!jobHasEmbedding || !resumeHasEmbedding) {
      this.logger.warn(
        `Missing embeddings for Application ${applicationId}: Job=${!!jobHasEmbedding}, Resume=${!!resumeHasEmbedding}`
      );
      return null;
    }

    const percentage = await this.calculateMatchPercentage(
      application.resumeId,
      application.jobId
    );

    if (percentage !== null) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { matchPercentage: percentage },
      });
      this.logger.log(
        `Successfully updated Application ${applicationId} with percentage: ${percentage}%`
      );
      return percentage;
    }

    this.logger.warn(
      `Percentage calculation returned null for Application ${applicationId}`
    );
    return null;
  }

  /**
   * Clears match explanations for all applicants of a specific job
   * They will be recalculated with new job data on next access
   */
  async reRankApplicants(jobId: number): Promise<{ updatedCount: number }> {
    this.logger.log(`Clearing match explanations for job ID: ${jobId}`);

    const result = await this.prisma.application.updateMany({
      where: { jobId: jobId },
      data: { matchExplanation: undefined },
    });

    return { updatedCount: result.count };
  }

  /**
   * Finds the best matching candidates for a specific job posting using vector similarity.
   * This is the inverse of findJobsForResume.
   */
  async findMatchingCandidatesForJob(jobId: number, query: any) {
    const limit = query.pageSize || 10;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    this.logger.log(`Finding matching candidates for job ID: ${jobId}`);

    // 1. Get the Job embedding
    const jobResults: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT embedding FROM "JobPosting" WHERE id = $1`,
      jobId
    );

    if (!jobResults.length || !jobResults[0].embedding) {
      throw new NotFoundException(
        `Job ${jobId} has no embedding. Matching cannot be performed.`
      );
    }

    const jobVector = jobResults[0].embedding;

    // 2. Search for resumes matching this job vector
    // We only take the LATEST resume per candidate to avoid duplicates in the list
    const candidates: any[] = await this.prisma.$queryRawUnsafe(
      `
      WITH RankedResumes AS (
        SELECT 
          r.id as resume_id,
          r."candidateId",
          1 - (r.embedding <=> $1::vector) as similarity,
          ROW_NUMBER() OVER(PARTITION BY r."candidateId" ORDER BY r."createdAt" DESC) as rn
        FROM "resume" r
        WHERE r.embedding IS NOT NULL
      )
      SELECT resume_id, "candidateId", similarity, count(*) OVER() AS full_count
      FROM RankedResumes
      WHERE rn = 1
      ORDER BY similarity DESC
      LIMIT $2 OFFSET $3
      `,
      jobVector,
      limit,
      offset
    );

    if (candidates.length === 0) {
      return { candidates: [], total: 0, page, pageSize: limit, totalPages: 0 };
    }

    const total = parseInt(candidates[0].full_count, 10);
    const candidateIds = candidates.map((c) => c.candidateId);

    // 3. Fetch detailed profiles
    const users = await this.prisma.user.findMany({
      where: { id: { in: candidateIds } },
      include: {
        candidateDescription: true,
        candidateSkills: { include: { skill: true } },
        experiences: { orderBy: { startDate: 'desc' }, take: 2 },
        education: { orderBy: { startDate: 'desc' }, take: 1 },
      },
    });

    // 4. Check application status for each candidate on THIS job
    const applications = await this.prisma.application.findMany({
      where: {
        jobId: jobId,
        candidateId: { in: candidateIds },
      },
      select: { candidateId: true, status: true, id: true },
    });

    const result = candidates.map((c) => {
      const user = users.find((u) => u.id === c.candidateId);
      const application = applications.find(
        (a) => a.candidateId === c.candidateId
      );

      return {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        avatarUrl: user?.avatarUrl,
        title: user?.candidateDescription?.title,
        bio: user?.candidateDescription?.bio,
        skills: user?.candidateSkills.map((s) => s.skill.name),
        topExperiences: user?.experiences.map((e) => ({
          companyName: e.companyName,
          jobTitle: e.jobTitle,
          duration: `${e.startDate.getFullYear()} - ${
            e.endDate ? e.endDate.getFullYear() : 'Present'
          }`,
        })),
        matchPercentage: Math.max(0, c.similarity * 100),
        applicationStatus: application?.status || null,
        applicationId: application?.id || null,
        resumeId: c.resume_id,
      };
    });

    return {
      candidates: result,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Consistent with JobsService mapping
  private mapToJobResponse(job: any) {
    const { requirements, postedById, _count, ...rest } = job;

    return {
      ...rest,
      employerId: postedById,
      applicantsCount: _count?.applications,
      requirements: requirements
        ? requirements.map((jr: any) => ({
            skillId: jr.skillId,
            skillName: jr.skill.name,
            importance: jr.importance,
            minYearsExperience: jr.minYearsExperience,
          }))
        : [],
      salaryMin: rest.salaryMin ? Number(rest.salaryMin) : null,
      salaryMax: rest.salaryMax ? Number(rest.salaryMax) : null,
    };
  }
}
