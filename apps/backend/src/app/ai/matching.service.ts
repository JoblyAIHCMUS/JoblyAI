import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import { GetJobsQueryDTO } from '../jobs/dto/getJobsQueryDTO';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
  ) {}

  /**
   * Finds jobs that match a specific resume using vector similarity, with filters
   */
  async findJobsForResume(resumeId: number, query: GetJobsQueryDTO) {
    const limit = query.pageSize || 10;
    const page = query.page || 1;
    const offset = (page - 1) * limit;

    this.logger.log(`Finding filtered job recommendations for resume ID: ${resumeId}`);

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
      this.logger.warn(`Resume ${resumeId} has no embedding. Recommendations cannot be generated.`);
      return { jobs: [], total: 0, page, pageSize: limit, totalPages: 0 };
    }

    const vectorStr = resumeWithVector[0].embedding;

    // Build dynamic WHERE clause for raw SQL
    let whereClause = `status = 'OPEN' AND "deletedAt" IS NULL AND embedding IS NOT NULL`;
    const params: any[] = [vectorStr, limit, offset];
    let paramIndex = 4;

    if (query.q) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${query.q}%`);
      paramIndex++;
    }

    if (query.location) {
      whereClause += ` AND location ILIKE $${paramIndex}`;
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

    // Location priority logic: jobs matching the location exactly or partially come first
    let orderBy = `distance ASC`;
    if (query.location) {
      const locationParamIndex = params.findIndex(p => typeof p === 'string' && query.location && p.includes(query.location)) + 1;
      if (locationParamIndex > 0) {
        orderBy = `(CASE WHEN location ILIKE $${locationParamIndex} THEN 0 ELSE 1 END), distance ASC`;
      }
    }

    const matchedJobs: any[] = await this.prisma.$queryRawUnsafe(
      `
      SELECT id, (embedding <=> $1::vector) as distance, count(*) OVER() AS full_count
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
        
        return {
          ...this.mapToJobResponse(jobDetail),
          matchScore: Math.max(0, 1 - mj.distance),
        };
      })
      .filter(Boolean);

    return {
      jobs: sortedJobs,
      total,
      page,
      pageSize: limit,
      totalPages
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
