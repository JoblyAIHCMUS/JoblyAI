import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { InjectPrisma } from '../utils/inject.decorators';
import { CreateApplicationDTO } from './dto/createApplicationDTO';

@Injectable()
export class ApplicationsService {
  constructor(@InjectPrisma() private readonly prisma: PrismaClient) {}

  async createApplication(candidateId: string, dto: CreateApplicationDTO) {
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

    const existingApplication = await this.prisma.application.findFirst({
      where: {
        jobId: dto.jobId,
        candidateId,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('Already applied to this job');
    }

    // Create application
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
          },
        },
        resume: true,
      },
    });

    return application;
  }
}
