import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-type.enum';

import { MatchExplanationService } from '../ai/match-explanation.service';
import { PreShortlistService } from '../pre-shortlist/pre-shortlist.service';

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
  constructor(
    @InjectPrisma() private readonly prisma: PrismaClient,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly matchExplanationService: MatchExplanationService,
    private readonly preShortlistService: PreShortlistService
  ) {}

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

    let application;
    const include = {
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
    };

    if (existingApplication) {
      const activeStatuses: ApplicationStatus[] = [
        ApplicationStatus.APPLIED,
        ApplicationStatus.PRE_SHORTLIST_PENDING,
        ApplicationStatus.PRE_SHORTLIST_SUBMITTED,
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
        application = await this.prisma.application.update({
          where: { id: existingApplication.id },
          data: {
            status: ApplicationStatus.APPLIED, // temporary; will be updated below
            resumeId: dto.resumeId,
            matchPercentage: null,
            aiFeedback: Prisma.JsonNull,
            updatedAt: new Date(),
          },
          include,
        });
      }
    } else {
      // Create new application
      application = await this.prisma.application.create({
        data: {
          jobId: dto.jobId,
          candidateId,
          resumeId: dto.resumeId,
          status: ApplicationStatus.APPLIED, // temporary; will be updated below
        },
        include,
      });
    }

    if (!application) {
      throw new BadRequestException('Could not process application');
    }

    // Calculate match explanation (deterministic score with justification)
    try {
      await this.matchExplanationService.calculateExplanation(application.id);
    } catch (error) {
      console.error(
        `Failed to calculate match explanation for application ${application.id}:`,
        error
      );
    }

    // Re-load the application to get the updated matchPercentage
    const fresh = await this.prisma.application.findUnique({
      where: { id: application.id },
      select: { matchPercentage: true },
    });

    // Resolve the pre-shortlist status based on threshold + match score
    const initialStatus = await this.preShortlistService.resolveInitialStatus(
      dto.jobId,
      fresh?.matchPercentage ?? null
    );

    if (initialStatus !== application.status) {
      application = await this.prisma.application.update({
        where: { id: application.id },
        data: { status: initialStatus },
        include,
      });
    }

    try {
      this.eventEmitter.emit('job.viewed', { jobId: job.id });
    } catch (error) {
      console.error(`Failed to emit job.viewed for job ${job.id}:`, error);
    }

    await this.notificationsService.createNotifications([
      {
        recipientId: job.postedById,
        type: NotificationType.NEW_APPLICATION,
        title: 'New Job Application',
        content: `A new candidate has applied for your job: ${job.title}`,
        link: `/employer/all-applications/${application.id}`,
        metadata: { applicationId: application.id, jobId: job.id },
      },
      {
        recipientId: candidateId,
        type: NotificationType.APPLICATION_SUBMITTED,
        title: 'Application Submitted',
        content: `You have successfully applied for ${job.title}`,
        link: `/candidate/find-jobs/${job.id}`,
        metadata: { applicationId: application.id, jobId: job.id },
      },
    ]);

    return this.mapToApplicationResponse(application);
  }

  async listApplications(
    candidateId: string,
    query: GetApplicationsQueryDTO
  ): Promise<PaginatedApplicationsResponse> {
    const { page = 1, pageSize, status } = query;
    const skip = pageSize ? (page - 1) * pageSize : 0;

    const where = {
      candidateId,
      ...(status && { status }),
    };

    const [total, applications] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        skip,
        ...(pageSize && { take: pageSize }),
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
              _count: {
                select: { preShortlistQuestions: true },
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
      pageSize: pageSize || total,
      totalPages: pageSize ? Math.ceil(total / pageSize) : 1,
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

    const withdrawableStatuses: ApplicationStatus[] = [
      ApplicationStatus.APPLIED,
      ApplicationStatus.PRE_SHORTLIST_PENDING,
      ApplicationStatus.PRE_SHORTLIST_SUBMITTED,
      ApplicationStatus.INTERVIEW,
    ];
    if (!withdrawableStatuses.includes(application.status)) {
      throw new BadRequestException(
        'This application cannot be withdrawn in its current status'
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
    const { page = 1, pageSize, status, jobId, search } = query;
    const skip = pageSize ? (page - 1) * pageSize : 0;

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {
      job: {
        postedById: employerId,
        ...(jobId && { id: jobId }),
      },
      ...(status && { status }),
      ...(search && {
        candidate: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [total, applications] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        skip,
        ...(pageSize && { take: pageSize }),
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
              avatarUrl: true,
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
      pageSize: pageSize || total,
      totalPages: pageSize ? Math.ceil(total / pageSize) : 1,
    };
  }

  async getApplicationByIdForEmployer(
    employerId: string,
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
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.postedById !== employerId) {
      const isCompanyAdmin = await this.prisma.employer.findFirst({
        where: {
          companyId: application.job.companyId,
          employerId,
          role: 'admin',
        },
        select: { id: true },
      });
      if (!isCompanyAdmin) {
        throw new ForbiddenException(
          'You can only view applications for your own jobs'
        );
      }
    }

    return this.mapToApplicationResponse(application);
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
            companyId: true,
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
      application.status !== ApplicationStatus.PRE_SHORTLIST_PENDING &&
      application.status !== ApplicationStatus.PRE_SHORTLIST_SUBMITTED
    ) {
      throw new BadRequestException(
        'Only applications with APPLIED, PRE_SHORTLIST_PENDING, or PRE_SHORTLIST_SUBMITTED status can be shortlisted'
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

    // Notify candidate
    await this.notificationsService.createNotification({
      recipientId: updatedApplication.candidateId,
      type: NotificationType.APPLICATION_STATUS_UPDATE,
      title: 'Application Status Updated',
      content: `Your application for ${updatedApplication.job.title} has been moved to INTERVIEW.`,
      link: `/candidate/find-jobs/${updatedApplication.job.id}`,
      metadata: { applicationId: updatedApplication.id, status: 'INTERVIEW' },
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
            companyId: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.postedById !== employerId) {
      const isCompanyAdmin = await this.prisma.employer.findFirst({
        where: {
          companyId: application.job.companyId,
          employerId,
          role: 'admin',
        },
        select: { id: true },
      });
      if (!isCompanyAdmin) {
        throw new ForbiddenException(
          'You can only manage applications for your own jobs'
        );
      }
    }

    if (
      application.status !== ApplicationStatus.APPLIED &&
      application.status !== ApplicationStatus.PRE_SHORTLIST_PENDING &&
      application.status !== ApplicationStatus.PRE_SHORTLIST_SUBMITTED &&
      application.status !== ApplicationStatus.INTERVIEW
    ) {
      throw new BadRequestException(
        'Only applications with APPLIED, PRE_SHORTLIST_PENDING, PRE_SHORTLIST_SUBMITTED, or INTERVIEW status can be rejected'
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

    // Notify candidate
    await this.notificationsService.createNotification({
      recipientId: updatedApplication.candidateId,
      type: NotificationType.APPLICATION_REJECTED,
      title: 'Application Update',
      content: `Your application for ${updatedApplication.job.title} has been rejected.`,
      link: `/candidate/find-jobs/${updatedApplication.job.id}`,
      metadata: { applicationId: updatedApplication.id, status: 'REJECTED' },
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
            companyId: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.postedById !== employerId) {
      const isCompanyAdmin = await this.prisma.employer.findFirst({
        where: {
          companyId: application.job.companyId,
          employerId,
          role: 'admin',
        },
        select: { id: true },
      });
      if (!isCompanyAdmin) {
        throw new ForbiddenException(
          'You can only manage applications for your own jobs'
        );
      }
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

    // Notify candidate
    await this.notificationsService.createNotification({
      recipientId: updatedApplication.candidateId,
      type: NotificationType.APPLICATION_STATUS_UPDATE,
      title: 'Job Offer Received',
      content: `Congratulations! You have received an offer for ${updatedApplication.job.title}.`,
      link: `/candidate/find-jobs/${updatedApplication.job.id}`,
      metadata: { applicationId: updatedApplication.id, status: 'OFFER' },
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
      select: { postedById: true, companyId: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.postedById !== employerId) {
      const isCompanyAdmin = await this.prisma.employer.findFirst({
        where: {
          companyId: job.companyId,
          employerId,
          role: 'admin',
        },
        select: { id: true },
      });
      if (!isCompanyAdmin) {
        throw new ForbiddenException(
          'You can only view application stats for your own jobs'
        );
      }
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
      preShortlistQuestionsCount:
        application.job._count?.preShortlistQuestions ?? 0,
      jobDeletedAt: application.jobDeletedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      job: {
        id: application.job.id,
        title: application.job.title,
        description: application.job.description,
        companyName: application.job.company.name,
        companyLogoUrl: application.job.company.logoUrl,
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
          avatarUrl: application.candidate.avatarUrl,
        },
      }),
      ...(application.matchExplanation && {
        matchExplanation: application.matchExplanation,
      }),
    };
  }
}
