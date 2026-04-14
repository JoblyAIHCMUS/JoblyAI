import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, ApplicationStatus, Prisma } from '@prisma/client';
import { InjectPrisma } from '../decorators/inject.decorator';
import { CreateApplicationDTO } from './dto/createApplicationDTO';
import { GetApplicationsQueryDTO } from './dto/getApplicationsQueryDTO';
import { GetEmployerApplicationsQueryDTO } from './dto/getEmployerApplicationsQueryDTO';
import { RejectApplicationDTO } from './dto/rejectApplicationDTO';
import {
  Application,
  PaginatedApplicationsResponse,
} from './applications.interface';

type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    job: {
      include: {
        category: true;
        company: true;
        postedBy: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    resume: {
      select: {
        id: true;
        fileKey: true;
        aiScore: true;
        isDefault: true;
      };
    };
  };
}>;

@Injectable()
export class ApplicationsService {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

  async createApplication(
    candidateId: string,
    dto: CreateApplicationDTO
  ): Promise<Application> {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'OPEN') {
      throw new BadRequestException('Job is not open for applications');
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id: dto.resumeId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.candidateId !== candidateId) {
      throw new ForbiddenException('Resume does not belong to you');
    }

    // Check for existing application
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        jobId: dto.jobId,
        candidateId,
      },
    });

    if (existingApplication) {
      const activeStatuses: ApplicationStatus[] = [
        ApplicationStatus.APPLIED,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.OFFER,
      ];

      // Block if already active or rejected
      if (
        activeStatuses.includes(existingApplication.status) ||
        existingApplication.status === ApplicationStatus.REJECTED
      ) {
        throw new BadRequestException('Already applied to this job');
      }

      // Only WITHDRAWN can re-apply - update existing record
      if (existingApplication.status === ApplicationStatus.WITHDRAWN) {
        const application = await this.prisma.application.update({
          where: { id: existingApplication.id },
          data: {
            status: ApplicationStatus.APPLIED,
            resumeId: dto.resumeId,
            matchPercentage: null,
            aiFeedback: Prisma.JsonNull,
            updatedAt: new Date(),
          },
          include: {
            job: {
              include: {
                category: true,
                company: true,
                postedBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            resume: {
              select: {
                id: true,
                fileKey: true,
                aiScore: true,
                isDefault: true,
              },
            },
          },
        });

        return this.mapToApplicationResponse(application);
      }
    }

    // Create new application
    const application = await this.prisma.application.create({
      data: {
        jobId: dto.jobId,
        candidateId,
        resumeId: dto.resumeId,
        status: ApplicationStatus.APPLIED,
      },
      include: {
        job: {
          include: {
            category: true,
            company: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileKey: true,
            aiScore: true,
            isDefault: true,
          },
        },
      },
    });

    return this.mapToApplicationResponse(application);
  }

  async listApplications(
    candidateId: string,
    query: GetApplicationsQueryDTO
  ): Promise<PaginatedApplicationsResponse> {
    const { page = 1, pageSize = 10, status } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      candidateId,
      ...(status && { status }),
    };

    const [total, applications] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          job: {
            include: {
              category: true,
              company: true,
              postedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          resume: {
            select: {
              id: true,
              fileKey: true,
              aiScore: true,
              isDefault: true,
            },
          },
        },
      }),
    ]);

    const mappedApplications = applications.map((app) =>
      this.mapToApplicationResponse(app)
    );

    return {
      applications: mappedApplications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getApplicationById(
    candidateId: string,
    applicationId: number
  ): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            category: true,
            company: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileKey: true,
            aiScore: true,
            isDefault: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.candidateId !== candidateId) {
      throw new ForbiddenException('This application does not belong to you');
    }

    return this.mapToApplicationResponse(application);
  }

  async withdrawApplication(
    candidateId: string,
    applicationId: number
  ): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.candidateId !== candidateId) {
      throw new ForbiddenException('This application does not belong to you');
    }

    if (application.status !== ApplicationStatus.APPLIED) {
      throw new BadRequestException(
        'Only applications with APPLIED status can be withdrawn'
      );
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.WITHDRAWN,
        updatedAt: new Date(),
      },
      include: {
        job: {
          include: {
            category: true,
            company: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileKey: true,
            aiScore: true,
            isDefault: true,
          },
        },
      },
    });

    return this.mapToApplicationResponse(updatedApplication);
  }

  // Employer methods
  async getApplicationsForEmployer(
    employerId: string,
    query: GetEmployerApplicationsQueryDTO
  ): Promise<PaginatedApplicationsResponse> {
    const { page = 1, pageSize = 10, status, jobId } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {
      job: {
        postedById: employerId,
        ...(jobId && { id: jobId }),
      },
      ...(status && { status }),
    };

    const [total, applications] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          job: {
            include: {
              category: true,
              company: true,
              postedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          resume: {
            select: {
              id: true,
              fileKey: true,
              aiScore: true,
              isDefault: true,
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const mappedApplications = applications.map((app) =>
      this.mapToApplicationResponse(app as ApplicationWithRelations)
    );

    return {
      applications: mappedApplications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async shortlistApplication(
    employerId: string,
    applicationId: number
  ): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            postedById: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.postedById !== employerId) {
      throw new ForbiddenException(
        'You can only manage applications for your own jobs'
      );
    }

    if (application.status !== ApplicationStatus.APPLIED) {
      throw new BadRequestException(
        'Only applications with APPLIED status can be shortlisted'
      );
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.INTERVIEW,
        updatedAt: new Date(),
      },
      include: {
        job: {
          include: {
            category: true,
            company: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileKey: true,
            aiScore: true,
            isDefault: true,
          },
        },
      },
    });

    return this.mapToApplicationResponse(updatedApplication);
  }

  async rejectApplication(
    employerId: string,
    applicationId: number,
    dto: RejectApplicationDTO
  ): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            postedById: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.postedById !== employerId) {
      throw new ForbiddenException(
        'You can only manage applications for your own jobs'
      );
    }

    if (
      application.status !== ApplicationStatus.APPLIED &&
      application.status !== ApplicationStatus.INTERVIEW
    ) {
      throw new BadRequestException(
        'Only applications with APPLIED or INTERVIEW status can be rejected'
      );
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.REJECTED,
        aiFeedback: {
          ...(typeof application.aiFeedback === 'object' &&
          application.aiFeedback !== null
            ? application.aiFeedback
            : {}),
          rejectionFeedback: dto.feedback,
          rejectedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      },
      include: {
        job: {
          include: {
            category: true,
            company: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileKey: true,
            aiScore: true,
            isDefault: true,
          },
        },
      },
    });

    return this.mapToApplicationResponse(updatedApplication);
  }

  async moveToOfferApplication(
    employerId: string,
    applicationId: number
  ): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            postedById: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.postedById !== employerId) {
      throw new ForbiddenException(
        'You can only manage applications for your own jobs'
      );
    }

    if (application.status !== ApplicationStatus.INTERVIEW) {
      throw new BadRequestException(
        'Only applications with INTERVIEW status can be moved to OFFER'
      );
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.OFFER,
        updatedAt: new Date(),
      },
      include: {
        job: {
          include: {
            category: true,
            company: true,
            postedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileKey: true,
            aiScore: true,
            isDefault: true,
          },
        },
      },
    });

    return this.mapToApplicationResponse(updatedApplication);
  }

  async getApplicationCountsByJob(
    employerId: string,
    jobId: number
  ): Promise<{
    total: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  }> {
    // Verify that the job belongs to the employer
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { postedById: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.postedById !== employerId) {
      throw new ForbiddenException(
        'You can only view application stats for your own jobs'
      );
    }

    // Count applications by status
    const where = { jobId };

    const [total, applied, interview, offer, rejected] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.count({
        where: { ...where, status: ApplicationStatus.APPLIED },
      }),
      this.prisma.application.count({
        where: { ...where, status: ApplicationStatus.INTERVIEW },
      }),
      this.prisma.application.count({
        where: { ...where, status: ApplicationStatus.OFFER },
      }),
      this.prisma.application.count({
        where: { ...where, status: ApplicationStatus.REJECTED },
      }),
    ]);

    return {
      total,
      applied,
      interview,
      offer,
      rejected,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToApplicationResponse(application: any): Application {
    return {
      id: application.id,
      jobId: application.jobId,
      candidateId: application.candidateId,
      resumeId: application.resumeId,
      status: application.status,
      matchPercentage: application.matchPercentage
        ? Number(application.matchPercentage)
        : null,
      aiFeedback: application.aiFeedback,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      job: {
        id: application.job.id,
        title: application.job.title,
        description: application.job.description,
        companyName: application.job.company.name,
        location: application.job.location,
        salaryMin: application.job.salaryMin
          ? Number(application.job.salaryMin)
          : null,
        salaryMax: application.job.salaryMax
          ? Number(application.job.salaryMax)
          : null,
        currency: application.job.currency,
        remote: application.job.remote,
        type: application.job.type,
        status: application.job.status,
        category: application.job.category,
        postedBy: application.job.postedBy,
      },
      resume: application.resume,
      ...(application.candidate && {
        candidate: {
          id: application.candidate.id,
          name: application.candidate.name,
          email: application.candidate.email,
        },
      }),
    };
  }
}
