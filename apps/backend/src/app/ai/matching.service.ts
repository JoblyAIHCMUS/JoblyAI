import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
  ) {}

  /**
   * Finds jobs that match a specific resume using vector similarity
   */
  async findJobsForResume(resumeId: number, limit: number = 10) {
    this.logger.log(`Finding job recommendations for resume ID: ${resumeId}`);

    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
      select: { id: true },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${resumeId} not found`);
    }

    // Note: In Prisma, Unsupported types are handled via raw queries
    // We fetch the embedding directly using raw SQL to ensure we get the vector format
    const resumeWithVector: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT embedding FROM "resume" WHERE id = $1`,
      resumeId
    );

    if (!resumeWithVector.length || !resumeWithVector[0].embedding) {
      this.logger.warn(`Resume ${resumeId} has no embedding. Recommendations cannot be generated.`);
      return { jobs: [], total: 0, page: 1, pageSize: limit, totalPages: 0 };
    }

    const vectorStr = resumeWithVector[0].embedding;

    // Use pgvector cosine similarity (<=>) to find the closest job postings
    // Lower distance = more similar
    const matchedJobs: any[] = await this.prisma.$queryRawUnsafe(
      `
      SELECT id, (embedding <=> $1::vector) as distance
      FROM "JobPosting"
      WHERE status = 'OPEN' AND "deletedAt" IS NULL AND embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT $2
      `,
      vectorStr,
      limit
    );

    if (matchedJobs.length === 0) {
      return { jobs: [], total: 0, page: 1, pageSize: limit, totalPages: 0 };
    }

    const jobIds = matchedJobs.map((j) => j.id);

    // Fetch full job details
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

    // Sort jobs based on the original similarity ranking and map to standard response
    const sortedJobs = matchedJobs
      .map((mj) => {
        const jobDetail = jobs.find((j) => j.id === mj.id);
        if (!jobDetail) return null;
        
        return {
          ...this.mapToJobResponse(jobDetail),
          matchScore: Math.max(0, 1 - mj.distance), // Convert distance to a similarity score (0 to 1)
        };
      })
      .filter(Boolean);

    return {
      jobs: sortedJobs,
      total: sortedJobs.length,
      page: 1,
      pageSize: limit,
      totalPages: 1
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
