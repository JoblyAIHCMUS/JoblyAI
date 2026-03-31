import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmploymentType, Prisma, PrismaClient } from '@prisma/client';
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

    if (type) whereClause.type = type as EmploymentType;

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
      whereClause.AND = [
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
    }

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
}
