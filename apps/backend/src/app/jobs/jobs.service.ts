import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaClient, Prisma, EmploymentType } from "@prisma/client";
import { JobPosting as JobPostingInterface, PaginatedJobsResponse } from "./jobPosting.interface";
import { GetJobsQueryDTO } from "./dto/getJobsQueryDTO";
import { InjectPrisma } from "../utils/inject.decorators";
import { CreateJobDto } from "./dto/createJobDTO";

type JobWithRelations = Prisma.JobPostingGetPayload<{
  include: {
    requirements: {
      include: {
        skill: true
      }
    }
  }
}>;

@Injectable()
export class JobsService {
    constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

    async getsPaginatedJobsPostings(query: GetJobsQueryDTO): Promise<PaginatedJobsResponse> {
        const { page = 1, pageSize = 10, q, location, remote, type, salaryMin, salaryMax, skills } = query;

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
        
        if (type) whereClause.type = type as unknown as EmploymentType;

        // Filtering by skills through the requirements join table
        if (skills && skills.length > 0) {
            whereClause.requirements = {
                some: {
                    skill: {
                        name: { in: skills }
                    }
                }
            };
        }

        // Salary range filtering with null-safe handling
        if (salaryMin !== undefined || salaryMax !== undefined) {
            whereClause.AND = [
                // If user sets a Min (Floor), ensure Job Max is High Enough OR Unlimited
                ...(salaryMin !== undefined ? [{
                    OR: [
                        { salaryMax: { gte: salaryMin } },
                        { salaryMax: null }
                    ]
                }] : []),

                // If user sets a Max (Ceiling), ensure Job Min is Low Enough OR Unspecified
                ...(salaryMax !== undefined ? [{
                    OR: [
                        { salaryMin: { lte: salaryMax } },
                        { salaryMin: null }
                    ]
                }] : [])
            ];
        }

        const [total, jobs] = await this.prisma.$transaction([
            this.prisma.jobPosting.count({ where: whereClause }),
            this.prisma.jobPosting.findMany({
                where: whereClause,
                include: {
                    // We must include this to flatten it later for the interface
                    requirements: {
                        include: {
                            skill: true
                        }
                    }
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

    async createJob(dto: CreateJobDto, userId: string): Promise<JobPostingInterface> {
        const { requirements, ...jobData } = dto;

        const createdJob = await this.prisma.jobPosting.create({
            data: {
                ...jobData,
                postedById: userId,
                requirements: requirements && requirements.length > 0 ? {
                create: requirements.map((req) => ({
                    skillId: req.skillId,
                    importance: req.importance,
                    minYearsExperience: req.minYearsExperience
                }))
                } : undefined,
            },
            include: {
                requirements: {
                include: {
                    skill: true
                }
                }
            }
        });

        return this.mapToJobResponse(createdJob);
    }

    async getJobById(id: number): Promise<JobPostingInterface> {
        const job = await this.prisma.jobPosting.findUnique({
            where: { id },
            include: {
                requirements: {
                    include: {
                        skill: true
                    }
                }
            }
        });
        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }
        return this.mapToJobResponse(job);
    }

    async deleteJobById(id: number, userId: string): Promise<void> {
        const job = await this.prisma.jobPosting.findUnique({
            where: { id },
        });
        if (!job || job.postedById !== userId) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }
        await this.prisma.jobPosting.delete({
            where: { id }
        });
    }

    async getJobsByUserId(userId: string): Promise<JobPostingInterface[]> {
        const jobs = await this.prisma.jobPosting.findMany({
            where: { postedById: userId },
            include: {
                requirements: {
                    include: {
                        skill: true
                    }
                }
            }
        });
        return jobs.map((job) => this.mapToJobResponse(job));
    }

    private mapToJobResponse(job: JobWithRelations): JobPostingInterface {
        const { requirements, ...rest } = job;
        
        return {
            ...rest,
            // Flatten the skills array
            skills: requirements ? requirements.map((jr) => jr.skill.name) : [],
            
            // Convert Prisma Decimals to JavaScript Numbers
            salaryMin: rest.salaryMin ? Number(rest.salaryMin) : null,
            salaryMax: rest.salaryMax ? Number(rest.salaryMax) : null,
        } as unknown as JobPostingInterface;
    }
}