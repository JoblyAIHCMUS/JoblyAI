import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmploymentType, Prisma, PrismaClient } from '@prisma/client';
import {
  JobPosting as JobPostingInterface,
  PaginatedJobsResponse,
  PopularJobCategory,
} from './jobs.interface';
import { GetJobsQueryDTO } from './dto/getJobsQueryDTO';
import { InjectPrisma } from '../decorators/inject.decorator';
import { CreateJobDTO } from './dto/createJobDTO';
import { UpdateJobDTO } from './dto/updateJobDTO';
import { PreShortlistService } from '../pre-shortlist/pre-shortlist.service';

type JobWithRelations = Prisma.JobPostingGetPayload<{
  include: {
    category: true;
    company: true;
    requirements: {
      include: {
        skill: true;
      };
    };
    preShortlistQuestions: true;
  };
}> & {
  _count?: {
    applications: number;
  };
};

@Injectable()
export class JobsService {
  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly eventEmitter: EventEmitter2,
    private readonly preShortlistService: PreShortlistService
  ) {}

  async getsPaginatedJobsPostings(
    query: GetJobsQueryDTO
  ): Promise<PaginatedJobsResponse> {
    const {
      page = 1,
      pageSize = 10,
      q,
      sort,
      location,
      remote,
      type,
      salaryMin,
      salaryMax,
      currency,
      skills,
      categories,
      status,
    } = query;

    const whereClause: Prisma.JobPostingWhereInput = {
      deletedAt: null,
    };

    // Default to OPEN status if not provided (candidates should only see published jobs)
    if (status && status.length > 0) {
      whereClause.status = { in: status };
    } else {
      whereClause.status = 'OPEN';
    }

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (remote !== undefined) whereClause.remote = remote;

    if (type && type.length > 0) {
      whereClause.type = { in: type as EmploymentType[] };
    }

    // Filtering by categories
    if (categories && categories.length > 0) {
      whereClause.categoryId = { in: categories };
    }

    // Filtering by skills through the requirements join table
    if (skills && skills.length > 0) {
      whereClause.requirements = {
        some: {
          skill: {
            name: { in: skills },
          },
        },
      };
    }

    // Salary range filtering with null-safe handling
    if (salaryMin !== undefined || salaryMax !== undefined) {
      const salaryConditions = [
        // If user sets a Min (Floor), ensure Job Max is High Enough OR Unlimited
        ...(salaryMin !== undefined
          ? [
              {
                OR: [{ salaryMax: { gte: salaryMin } }, { salaryMax: null }],
              },
            ]
          : []),

        // If user sets a Max (Ceiling), ensure Job Min is Low Enough OR Unspecified
        ...(salaryMax !== undefined
          ? [
              {
                OR: [{ salaryMin: { lte: salaryMax } }, { salaryMin: null }],
              },
            ]
          : []),
      ];

      // Merge with existing AND conditions if present, or create new
      if (whereClause.AND && Array.isArray(whereClause.AND)) {
        const existingConditions =
          whereClause.AND as Prisma.JobPostingWhereInput[];
        existingConditions.push(...salaryConditions);
      } else {
        whereClause.AND = salaryConditions;
      }
    }

    // Currency filter: scope salary comparisons to a single currency
    if (currency) {
      if (whereClause.AND && Array.isArray(whereClause.AND)) {
        (whereClause.AND as Prisma.JobPostingWhereInput[]).push({ currency });
      } else {
        whereClause.AND = [{ currency }];
      }
    }

    const orderBy = this.buildOrderBy(sort, q);

    const [total, jobs] = await this.prisma.$transaction([
      this.prisma.jobPosting.count({ where: whereClause }),
      this.prisma.jobPosting.findMany({
        where: whereClause,
        include: {
          category: true,
          company: true,
          // We must include this to flatten it later for the interface
          requirements: {
            include: {
              skill: true,
            },
          },
          preShortlistQuestions: { orderBy: { order: 'asc' } },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
      }),
    ]);

    const mappedJobs = jobs.map((job) => this.mapToJobResponse(job));

    for (const job of mappedJobs) {
      try {
        this.eventEmitter.emit('job.viewed', { jobId: job.id });
      } catch (error) {
        console.error(`Failed to emit job.viewed for job ${job.id}:`, error);
      }
    }

    return {
      jobs: mappedJobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async createJob(
    dto: CreateJobDTO,
    userId: string
  ): Promise<JobPostingInterface> {
    const { requirements, preShortlistQuestions, ...jobData } = dto;

    this.preShortlistService.validateQuestions(preShortlistQuestions);
    const threshold = dto.preShortlistThreshold ?? 0;

    const createdJob = await this.prisma.jobPosting.create({
      data: {
        ...jobData,
        postedById: userId,
        preShortlistThreshold: threshold,
        preShortlistQuestions:
          preShortlistQuestions && preShortlistQuestions.length > 0
            ? {
                create: preShortlistQuestions.map((q, idx) => ({
                  order: idx,
                  question: q,
                })),
              }
            : undefined,
        requirements:
          requirements && requirements.length > 0
            ? {
                create: requirements.map((req) => ({
                  skillId: req.skillId,
                  importance: req.importance,
                  minYearsExperience: req.minYearsExperience,
                })),
              }
            : undefined,
      },
      include: {
        category: true,
        company: true,
        requirements: {
          include: {
            skill: true,
          },
        },
        preShortlistQuestions: { orderBy: { order: 'asc' } },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    const mapped = this.mapToJobResponse(createdJob);

    // Emit event to generate embedding in background
    this.eventEmitter.emit('job.posting.updated', {
      id: mapped.id,
      content: this.buildJobEmbeddingContent(mapped),
    });

    return mapped;
  }

  async getJobById(id: number): Promise<JobPostingInterface> {
    const job = await this.prisma.jobPosting.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        company: true,
        requirements: {
          include: {
            skill: true,
          },
        },
        preShortlistQuestions: { orderBy: { order: 'asc' } },
      },
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    // Prevent public access to DRAFT and CLOSED jobs - only OPEN jobs are visible
    if (job.status !== 'OPEN') {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return this.mapToJobResponse(job);
  }

  async getJobByIdForEmployer(
    id: number,
    employerId: string,
    userRole: string
  ): Promise<JobPostingInterface> {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        category: true,
        company: true,
        requirements: {
          include: {
            skill: true,
          },
        },
        preShortlistQuestions: { orderBy: { order: 'asc' } },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // Authorization check: verify employer owns the company that posted this job
    if (userRole !== 'admin') {
      const employer = await this.prisma.employer.findUnique({
        where: { employerId },
        include: { company: true },
      });

      if (!employer) {
        throw new ForbiddenException('Employer profile not found');
      }

      if (job.companyId !== employer.company?.id) {
        throw new ForbiddenException(
          'You do not have permission to view this job'
        );
      }
    }

    return this.mapToJobResponse(job);
  }

  async deleteJobById(
    id: number,
    userId: string,
    userRole: string
  ): Promise<void> {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    // Allow deletion if user is the one who posted it or if user is an admin
    if (job.postedById !== userId && userRole !== 'admin') {
      throw new ForbiddenException(
        `You do not have permission to delete this job`
      );
    }

    // Soft delete the job: set deletedAt and change status to CLOSED
    await this.prisma.jobPosting.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'CLOSED',
      },
    });

    // Mark all applications as job deleted to notify candidates
    await this.prisma.application.updateMany({
      where: { jobId: id },
      data: { jobDeletedAt: new Date() },
    });
  }

  async getJobsByUserId(
    userId: string,
    query?: Partial<GetJobsQueryDTO>
  ): Promise<PaginatedJobsResponse> {
    // Explicitly parse query parameters to numbers to handle string values from HTTP query params
    const page = Math.max(1, parseInt(String(query?.page || 1), 10));
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(String(query?.pageSize || 10), 10))
    );

    const [total, jobs] = await this.prisma.$transaction([
      this.prisma.jobPosting.count({
        where: { postedById: userId, deletedAt: null },
      }),
      this.prisma.jobPosting.findMany({
        where: { postedById: userId, deletedAt: null },
        include: {
          category: true,
          company: true,
          requirements: {
            include: {
              skill: true,
            },
          },
          preShortlistQuestions: { orderBy: { order: 'asc' } },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mappedJobs = jobs.map((job) => this.mapToJobResponse(job));

    return {
      jobs: mappedJobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getJobsByCompanyId(
    companyId: number,
    query?: Partial<GetJobsQueryDTO>
  ): Promise<PaginatedJobsResponse> {
    // Explicitly parse query parameters to numbers to handle string values from HTTP query params
    const page = Math.max(1, parseInt(String(query?.page || 1), 10));
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(String(query?.pageSize || 10), 10))
    );

    const [total, jobs] = await this.prisma.$transaction([
      this.prisma.jobPosting.count({
        where: { companyId, deletedAt: null },
      }),
      this.prisma.jobPosting.findMany({
        where: { companyId, deletedAt: null },
        include: {
          category: true,
          company: true,
          requirements: {
            include: {
              skill: true,
            },
          },
          preShortlistQuestions: { orderBy: { order: 'asc' } },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mappedJobs = jobs.map((job) => this.mapToJobResponse(job));

    return {
      jobs: mappedJobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateJobById(
    id: number,
    dto: UpdateJobDTO,
    userId: string,
    userRole: string
  ): Promise<JobPostingInterface> {
    const job = await this.prisma.jobPosting.findFirst({
      where: { id, deletedAt: null },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.postedById !== userId && userRole !== 'admin') {
      throw new ForbiddenException(
        `You do not have permission to update this job`
      );
    }

    const {
      requirements,
      preShortlistQuestions,
      preShortlistThreshold,
      ...jobData
    } = dto;

    // Gate questions: if the job already has applications, reject the change.
    if (preShortlistQuestions !== undefined) {
      this.preShortlistService.validateQuestions(preShortlistQuestions);
      const hasApplications = await this.prisma.application.count({
        where: { jobId: id },
      });
      if (hasApplications > 0) {
        throw new BadRequestException(
          'Pre-shortlist questions cannot be edited after applications exist. The threshold was still updated if you included one.'
        );
      }
    }

    const updatedJob = await this.prisma.jobPosting.update({
      where: { id },
      data: {
        ...jobData,
        preShortlistThreshold: preShortlistThreshold ?? undefined,
        preShortlistQuestions: preShortlistQuestions
          ? {
              deleteMany: {},
              create: preShortlistQuestions.map((q, idx) => ({
                order: idx,
                question: q,
              })),
            }
          : undefined,
        // Handle skills if provided
        requirements: requirements
          ? {
              deleteMany: {},
              create: requirements.map((req) => ({
                skillId: req.skillId,
                importance: req.importance,
                minYearsExperience: req.minYearsExperience,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        company: true,
        requirements: {
          include: {
            skill: true,
          },
        },
        preShortlistQuestions: { orderBy: { order: 'asc' } },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // Reset match percentages for all applications since requirements/details changed
    // This provides visual feedback to the user that scores are being recalculated
    await this.prisma.application.updateMany({
      where: { jobId: id },
      data: { matchPercentage: null },
    });

    const mapped = this.mapToJobResponse(updatedJob);

    // Emit event to regenerate embedding in background
    this.eventEmitter.emit('job.posting.updated', {
      id: mapped.id,
      content: this.buildJobEmbeddingContent(mapped),
    });

    return mapped;
  }

  /**
   * Builds a semantic content string for job embedding
   */
  private buildJobEmbeddingContent(job: JobPostingInterface): string {
    const skills = job.requirements.map((r) => r.skillName).join(', ');
    return `Title: ${job.title} | Category: ${
      job.category?.name || ''
    } | Type: ${job.type} | Location: ${
      job.location || 'Remote'
    } | Description: ${job.description} | Requirements: ${skills}`;
  }

  async getJobsByCategoryId(
    categoryId: number
  ): Promise<JobPostingInterface[]> {
    const jobs = await this.prisma.jobPosting.findMany({
      where: {
        categoryId,
        // Only return OPEN jobs for public category view
        status: 'OPEN',
        deletedAt: null,
      },
      include: {
        category: true,
        company: true,
        requirements: {
          include: {
            skill: true,
          },
        },
        preShortlistQuestions: { orderBy: { order: 'asc' } },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
    return jobs.map((job) => this.mapToJobResponse(job));
  }

  async getSimilarJobs(params: {
    jobId?: number;
    companyId?: number;
    location?: string;
    limit?: number;
  }): Promise<JobPostingInterface[]> {
    const { jobId, companyId, location, limit = 6 } = params;

    const whereClause: Prisma.JobPostingWhereInput = {
      status: 'OPEN',
      deletedAt: null,
    };

    if (jobId) {
      const job = await this.prisma.jobPosting.findUnique({
        where: { id: jobId },
        select: { categoryId: true },
      });
      if (job) {
        whereClause.categoryId = job.categoryId;
        whereClause.id = { not: jobId };
      }
    } else if (companyId) {
      whereClause.companyId = companyId;
    } else if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    const jobs = await this.prisma.jobPosting.findMany({
      where: whereClause,
      include: {
        category: true,
        company: true,
        requirements: {
          include: {
            skill: true,
          },
        },
        preShortlistQuestions: { orderBy: { order: 'asc' } },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((job) => this.mapToJobResponse(job));
  }

  async getCategories(): Promise<
    Array<{ id: number; name: string; slug: string; iconKey: string | null }>
  > {
    const categories = await this.prisma.jobCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  async getPopularCategories(limit: number): Promise<PopularJobCategory[]> {
    const categories = await this.prisma.jobCategory.findMany({
      include: {
        _count: {
          select: {
            jobs: {
              where: {
                status: 'OPEN',
              },
            },
          },
        },
      },
    });

    return categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        iconKey: cat.iconKey,
        jobCount: cat._count.jobs,
      }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, limit);
  }

  /**
   * Get job view analytics for an employer's jobs
   * Aggregates views by time period for all jobs posted by the employer
   * @param employerId The employer's user ID
   * @param startDate Start of the date range (inclusive)
   * @param endDate End of the date range (inclusive)
   * @param groupBy How to group the results: 'day' | 'week' | 'month'
   */
  async getJobViewsAnalytics(
    employerId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<Array<{ period: string; jobId: number; viewCount: number }>> {
    // Get all jobs posted by this employer
    const employerJobs = await this.prisma.jobPosting.findMany({
      where: { postedById: employerId },
      select: { id: true },
    });

    const jobIds = employerJobs.map((j) => j.id);

    if (jobIds.length === 0) {
      return [];
    }

    // Fetch all views for these jobs within the date range
    const rawViews = await this.prisma.jobView.findMany({
      where: {
        jobId: { in: jobIds },
        viewedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        jobId: true,
        viewedAt: true,
      },
    });

    // Group views by period and job
    const groupedViews = new Map<string, Map<number, number>>();

    rawViews.forEach(({ jobId, viewedAt }) => {
      let periodKey: string;

      if (groupBy === 'day') {
        periodKey = viewedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        const date = new Date(viewedAt);
        const dayOfWeek = date.getDay();
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - dayOfWeek); // Sunday
        periodKey = weekStart.toISOString().split('T')[0];
      } else {
        // month
        periodKey = viewedAt.toISOString().substring(0, 7); // YYYY-MM
      }

      if (!groupedViews.has(periodKey)) {
        groupedViews.set(periodKey, new Map<number, number>());
      }

      const jobCounts = groupedViews.get(periodKey);
      if (jobCounts) {
        jobCounts.set(jobId, (jobCounts.get(jobId) || 0) + 1);
      }
    });

    // Convert to flat array format
    const result: Array<{ period: string; jobId: number; viewCount: number }> =
      [];
    groupedViews.forEach((jobCounts, period) => {
      jobCounts.forEach((viewCount, jobId) => {
        result.push({ period, jobId, viewCount });
      });
    });

    return result.sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get aggregated job view statistics for a single job (chart + total)
   * @param jobId The job to scope to
   * @param startDate Start of the date range (inclusive)
   * @param endDate End of the date range (inclusive)
   * @param groupBy How to group the series: 'day' | 'week' | 'month'
   * @returns totalViews (all-time) and a series bucketed in [startDate, endDate]
   */
  async getJobViewsAnalyticsForJob(
    jobId: number,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    totalViews: number;
    series: Array<{ period: string; viewCount: number }>;
  }> {
    const [rawViews, totalViews] = await Promise.all([
      this.prisma.jobView.findMany({
        where: { jobId, viewedAt: { gte: startDate, lte: endDate } },
        select: { jobId: true, viewedAt: true },
      }),
      this.prisma.jobView.count({ where: { jobId } }),
    ]);

    const grouped = new Map<string, number>();
    rawViews.forEach(({ viewedAt }) => {
      let periodKey: string;
      if (groupBy === 'month') {
        periodKey = viewedAt.toISOString().substring(0, 7);
      } else if (groupBy === 'week') {
        const date = new Date(viewedAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
      } else {
        periodKey = viewedAt.toISOString().split('T')[0];
      }
      grouped.set(periodKey, (grouped.get(periodKey) || 0) + 1);
    });

    const series = Array.from(grouped.entries())
      .map(([period, viewCount]) => ({ period, viewCount }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return { totalViews, series };
  }

  /**
   * Get aggregated job view statistics for an employer (total views by job/period)
   * Useful for dashboard showing overall trends
   */
  async getJobApplicationsAnalytics(
    employerId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<
    Array<{ period: string; applicationCount: number; approvedCount: number }>
  > {
    // Get all jobs posted by this employer
    const employerJobs = await this.prisma.jobPosting.findMany({
      where: { postedById: employerId },
      select: { id: true },
    });

    const jobIds = employerJobs.map((j) => j.id);

    if (jobIds.length === 0) {
      return [];
    }

    // Fetch applications for these jobs within the date range
    const applications = await this.prisma.jobPosting.findMany({
      where: { id: { in: jobIds } },
      select: {
        applications: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            createdAt: true,
            status: true,
          },
        },
      },
    });

    // Aggregate by period
    const groupedApps = new Map<string, { total: number; approved: number }>();

    applications.forEach((job) => {
      job.applications.forEach(({ createdAt, status }) => {
        let periodKey: string;

        if (groupBy === 'day') {
          periodKey = createdAt.toISOString().split('T')[0];
        } else if (groupBy === 'week') {
          const date = new Date(createdAt);
          const dayOfWeek = date.getDay();
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - dayOfWeek);
          periodKey = weekStart.toISOString().split('T')[0];
        } else {
          // month
          periodKey = createdAt.toISOString().substring(0, 7);
        }

        if (!groupedApps.has(periodKey)) {
          groupedApps.set(periodKey, { total: 0, approved: 0 });
        }

        const counts = groupedApps.get(periodKey);
        if (counts) {
          counts.total += 1;
          if (status === 'INTERVIEW' || status === 'OFFER') {
            counts.approved += 1;
          }
        }
      });
    });

    // Convert to result format
    const result: Array<{
      period: string;
      applicationCount: number;
      approvedCount: number;
    }> = [];
    groupedApps.forEach(({ total, approved }, period) => {
      result.push({ period, applicationCount: total, approvedCount: approved });
    });

    return result.sort((a, b) => a.period.localeCompare(b.period));
  }

  private mapToJobResponse(job: JobWithRelations): JobPostingInterface {
    const { requirements, postedById, _count, ...rest } = job;

    return {
      ...rest,
      employerId: postedById,
      applicantsCount: _count?.applications,
      // Map requirements with full details including years and importance
      requirements: requirements
        ? requirements.map((jr) => ({
            skillId: jr.skillId,
            skillName: jr.skill.name,
            importance:
              jr.importance as JobPostingInterface['requirements'][0]['importance'],
            minYearsExperience: jr.minYearsExperience,
          }))
        : [],
      preShortlistThreshold: (job as any).preShortlistThreshold ?? 0,
      preShortlistQuestions:
        (job as any).preShortlistQuestions?.map((q: any) => ({
          id: q.id,
          order: q.order,
          question: q.question,
        })) ?? [],

      // Convert Prisma Decimals to JavaScript Numbers
      salaryMin: rest.salaryMin ? Number(rest.salaryMin) : null,
      salaryMax: rest.salaryMax ? Number(rest.salaryMax) : null,
    };
  }

  private buildOrderBy(
    sort?: string,
    q?: string
  ): Prisma.JobPostingOrderByWithRelationInput {
    switch (sort) {
      case 'MOST_RELEVANT':
        if (q) {
          // Use type assertion for _relevance which is only available with fullTextSearchPostgres preview feature
          return {
            _relevance: {
              fields: ['title', 'description'],
              search: q,
              sort: 'desc',
            },
          } as Prisma.JobPostingOrderByWithRelationInput;
        }
        return { createdAt: 'desc' };
      case 'NEWEST':
        return { createdAt: 'desc' };
      case 'OLDEST':
        return { createdAt: 'asc' };
      case 'SALARY_ASC':
        return { salaryMin: 'asc' };

      case 'SALARY_DESC':
        return { salaryMax: 'desc' };

      default:
        return { createdAt: 'desc' };
    }
  }
}
