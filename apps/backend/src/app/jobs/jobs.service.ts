import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmploymentType, Prisma, PrismaClient, SortOption } from '@prisma/client';
import {
  JobPosting as JobPostingInterface,
  PaginatedJobsResponse,
} from './jobs.interface';
import { GetJobsQueryDTO } from './dto/getJobsQueryDTO';
import { InjectPrisma } from '../decorators/inject.decorator';
import { CreateJobDTO } from './dto/createJobDTO';
import { UpdateJobDTO } from './dto/updateJobDTO';

type JobWithRelations = Prisma.JobPostingGetPayload<{
  include: {
    category: true;
    company: true;
    requirements: {
      include: {
        skill: true;
      };
    };
  };
}>;

@Injectable()
export class JobsService {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

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
      skills,
    } = query;

    const whereClause: Prisma.JobPostingWhereInput = {};

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
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
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

  async createJob(
    dto: CreateJobDTO,
    userId: string
  ): Promise<JobPostingInterface> {
    const { requirements, ...jobData } = dto;

    const createdJob = await this.prisma.jobPosting.create({
      data: {
        ...jobData,
        postedById: userId,
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
      },
    });

    return this.mapToJobResponse(createdJob);
  }

  async getJobById(id: number): Promise<JobPostingInterface> {
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
      },
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
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

    await this.prisma.jobPosting.delete({
      where: { id },
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
        where: { postedById: userId },
      }),
      this.prisma.jobPosting.findMany({
        where: { postedById: userId },
        include: {
          category: true,
          company: true,
          requirements: {
            include: {
              skill: true,
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
        where: { companyId },
      }),
      this.prisma.jobPosting.findMany({
        where: { companyId },
        include: {
          category: true,
          company: true,
          requirements: {
            include: {
              skill: true,
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
    const job = await this.prisma.jobPosting.findUnique({ where: { id } });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    if (job.postedById !== userId && userRole !== 'admin') {
      throw new ForbiddenException(
        `You do not have permission to update this job`
      );
    }

    const { requirements, ...jobData } = dto;

    const updatedJob = await this.prisma.jobPosting.update({
      where: { id },
      data: {
        ...jobData,
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
      },
    });

    return this.mapToJobResponse(updatedJob);
  }

  async getJobsByCategoryId(
    categoryId: number
  ): Promise<JobPostingInterface[]> {
    const jobs = await this.prisma.jobPosting.findMany({
      where: { categoryId },
      include: {
        category: true,
        company: true,
        requirements: {
          include: {
            skill: true,
          },
        },
      },
    });
    return jobs.map((job) => this.mapToJobResponse(job));
  }

  async getCategories(): Promise<
    Array<{ id: number; name: string; slug: string }>
  > {
    const categories = await this.prisma.jobCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  /**
   * Track a job view for analytics
   */
  async trackJobView(jobId: number): Promise<void> {
    try {
      await this.prisma.jobView.create({
        data: {
          jobId,
        },
      });
    } catch (error) {
      // Silently fail if view tracking fails - don't break the main flow
      console.error(`Failed to track view for job ${jobId}:`, error);
    }
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
    const { requirements, postedById, ...rest } = job;

    return {
      ...rest,
      employerId: postedById,
      // Flatten the skills array
      skills: requirements ? requirements.map((jr) => jr.skill.name) : [],

      // Convert Prisma Decimals to JavaScript Numbers
      salaryMin: rest.salaryMin ? Number(rest.salaryMin) : null,
      salaryMax: rest.salaryMax ? Number(rest.salaryMax) : null,
    };
  }


  private buildOrderBy(sort?: SortOption, q?: string): Prisma.JobPostingOrderByWithRelationInput {
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
