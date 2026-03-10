import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { ApplicationsService } from '../app/applications/applications.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

const prisma = new PrismaClient();
const applicationsService = new ApplicationsService(prisma);

describe('ApplicationsService', () => {
  let candidateId: string;
  let candidate2Id: string;
  let employerId: string;
  let employer2Id: string;
  let openJobId: number;
  let draftJobId: number;
  let employer2JobId: number;
  let resumeId: number;
  let resume2Id: number;

  beforeAll(async () => {
    // Cleanup test data if exists
    await prisma.application.deleteMany({
      where: {
        OR: [
          { candidate: { email: { contains: 'test-candidate-app' } } },
          { candidate: { email: { contains: 'test-candidate2-app' } } },
        ],
      },
    });
    await prisma.resume.deleteMany({
      where: {
        candidate: {
          email: {
            in: [
              'test-candidate-app@example.com',
              'test-candidate2-app@example.com',
            ],
          },
        },
      },
    });
    await prisma.jobPosting.deleteMany({
      where: {
        OR: [
          { title: { contains: 'Test Open Job App' } },
          { title: { contains: 'Test Draft Job App' } },
          { title: { contains: 'Test Employer 2 Job App' } },
        ],
      },
    });
    await prisma.jobCategory.deleteMany({
      where: { name: 'Test Category App' },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'test-candidate-app@example.com',
            'test-candidate2-app@example.com',
            'test-employer-app@example.com',
            'test-employer2-app@example.com',
          ],
        },
      },
    });

    // Create test candidates
    const candidate = await prisma.user.create({
      data: {
        email: 'test-candidate-app@example.com',
        name: 'Test Candidate App',
        role: 'candidate',
      },
    });
    candidateId = candidate.id;

    const candidate2 = await prisma.user.create({
      data: {
        email: 'test-candidate2-app@example.com',
        name: 'Test Candidate 2 App',
        role: 'candidate',
      },
    });
    candidate2Id = candidate2.id;

    // Create test employers
    const employer = await prisma.user.create({
      data: {
        email: 'test-employer-app@example.com',
        name: 'Test Employer App',
        role: 'employer',
      },
    });
    employerId = employer.id;

    const employer2 = await prisma.user.create({
      data: {
        email: 'test-employer2-app@example.com',
        name: 'Test Employer 2 App',
        role: 'employer',
      },
    });
    employer2Id = employer2.id;

    // Create test category
    const category = await prisma.jobCategory.create({
      data: {
        name: 'Test Category App',
        slug: 'test-category-app',
      },
    });

    // Create test jobs
    const openJob = await prisma.jobPosting.create({
      data: {
        title: 'Test Open Job App',
        description: 'Test description',
        status: 'OPEN',
        postedById: employerId,
        categoryId: category.id,
        type: 'FULL_TIME',
      },
    });
    openJobId = openJob.id;

    const draftJob = await prisma.jobPosting.create({
      data: {
        title: 'Test Draft Job App',
        description: 'Test description',
        status: 'DRAFT',
        postedById: employerId,
        categoryId: category.id,
        type: 'FULL_TIME',
      },
    });
    draftJobId = draftJob.id;

    const employer2Job = await prisma.jobPosting.create({
      data: {
        title: 'Test Employer 2 Job App',
        description: 'Test description',
        status: 'OPEN',
        postedById: employer2Id,
        categoryId: category.id,
        type: 'FULL_TIME',
      },
    });
    employer2JobId = employer2Job.id;

    // Create test resumes
    const resume = await prisma.resume.create({
      data: {
        candidateId,
        fileUrl: 'https://example.com/resume1.pdf',
        fileName: 'resume1.pdf',
        fileType: 'application/pdf',
        fileSize: 100000,
        isDefault: true,
      },
    });
    resumeId = resume.id;

    const resume2 = await prisma.resume.create({
      data: {
        candidateId: candidate2Id,
        fileUrl: 'https://example.com/resume2.pdf',
        fileName: 'resume2.pdf',
        fileType: 'application/pdf',
        fileSize: 100000,
        isDefault: true,
      },
    });
    resume2Id = resume2.id;
  });

  beforeEach(async () => {
    // Clean up applications before each test
    await prisma.application.deleteMany({
      where: {
        OR: [{ candidateId }, { candidateId: candidate2Id }],
      },
    });
  });

  describe('Candidate Operations', () => {
    describe('createApplication', () => {
      it('should create a new application successfully', async () => {
        const result = await applicationsService.createApplication(
          candidateId,
          {
            jobId: openJobId,
            resumeId,
          }
        );

        expect(result).toBeDefined();
        expect(result.jobId).toBe(openJobId);
        expect(result.candidateId).toBe(candidateId);
        expect(result.resumeId).toBe(resumeId);
        expect(result.status).toBe(ApplicationStatus.APPLIED);
        expect(result.job).toBeDefined();
        expect(result.resume).toBeDefined();
      });

      it('should throw NotFoundException if job does not exist', async () => {
        await expect(
          applicationsService.createApplication(candidateId, {
            jobId: 999999,
            resumeId,
          })
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw BadRequestException if job is not OPEN', async () => {
        await expect(
          applicationsService.createApplication(candidateId, {
            jobId: draftJobId,
            resumeId,
          })
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException if resume does not exist', async () => {
        await expect(
          applicationsService.createApplication(candidateId, {
            jobId: openJobId,
            resumeId: 999999,
          })
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException if resume belongs to another candidate', async () => {
        await expect(
          applicationsService.createApplication(candidateId, {
            jobId: openJobId,
            resumeId: resume2Id, // Belongs to candidate2
          })
        ).rejects.toThrow(ForbiddenException);
      });

      it('should throw BadRequestException on duplicate application (APPLIED)', async () => {
        // Create first application
        await applicationsService.createApplication(candidateId, {
          jobId: openJobId,
          resumeId,
        });

        // Try to apply again
        await expect(
          applicationsService.createApplication(candidateId, {
            jobId: openJobId,
            resumeId,
          })
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException if previous application was REJECTED', async () => {
        // Create and reject application
        const app = await applicationsService.createApplication(candidateId, {
          jobId: openJobId,
          resumeId,
        });

        await prisma.application.update({
          where: { id: app.id },
          data: { status: ApplicationStatus.REJECTED },
        });

        // Try to apply again
        await expect(
          applicationsService.createApplication(candidateId, {
            jobId: openJobId,
            resumeId,
          })
        ).rejects.toThrow(BadRequestException);
      });

      it('should allow re-apply after WITHDRAWN (updates existing record)', async () => {
        // Create and withdraw application
        const app = await applicationsService.createApplication(candidateId, {
          jobId: openJobId,
          resumeId,
        });

        const firstAppId = app.id;

        await prisma.application.update({
          where: { id: app.id },
          data: {
            status: ApplicationStatus.WITHDRAWN,
            matchPercentage: 85.5,
            aiFeedback: { test: 'data' },
          },
        });

        // Re-apply
        const result = await applicationsService.createApplication(
          candidateId,
          {
            jobId: openJobId,
            resumeId,
          }
        );

        expect(result.id).toBe(firstAppId); // Same ID
        expect(result.status).toBe(ApplicationStatus.APPLIED);
        expect(result.matchPercentage).toBeNull(); // Reset
        expect(result.aiFeedback).toBeNull(); // Reset
      });
    });

    describe('listApplications', () => {
      beforeEach(async () => {
        // Create test applications
        await prisma.application.createMany({
          data: [
            {
              jobId: openJobId,
              candidateId,
              resumeId,
              status: ApplicationStatus.APPLIED,
            },
            {
              jobId: employer2JobId,
              candidateId,
              resumeId,
              status: ApplicationStatus.INTERVIEW,
            },
            {
              jobId: openJobId,
              candidateId: candidate2Id,
              resumeId: resume2Id,
              status: ApplicationStatus.APPLIED,
            },
          ],
        });
      });

      it('should return paginated list of candidate applications', async () => {
        const result = await applicationsService.listApplications(candidateId, {
          page: 1,
          pageSize: 10,
        });

        expect(result.applications).toHaveLength(2);
        expect(result.total).toBe(2);
        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(10);
        expect(result.totalPages).toBe(1);
        expect(result.applications[0].candidateId).toBe(candidateId);
      });

      it('should filter applications by status', async () => {
        const result = await applicationsService.listApplications(candidateId, {
          page: 1,
          pageSize: 10,
          status: ApplicationStatus.INTERVIEW,
        });

        expect(result.applications).toHaveLength(1);
        expect(result.applications[0].status).toBe(ApplicationStatus.INTERVIEW);
      });

      it('should handle pagination correctly', async () => {
        const result = await applicationsService.listApplications(candidateId, {
          page: 1,
          pageSize: 1,
        });

        expect(result.applications).toHaveLength(1);
        expect(result.total).toBe(2);
        expect(result.totalPages).toBe(2);
      });

      it('should return empty list for candidate with no applications', async () => {
        const newCandidate = await prisma.user.create({
          data: {
            email: 'new-candidate-app@example.com',
            name: 'New Candidate App',
            role: 'candidate',
          },
        });

        const result = await applicationsService.listApplications(
          newCandidate.id,
          { page: 1, pageSize: 10 }
        );

        expect(result.applications).toHaveLength(0);
        expect(result.total).toBe(0);

        await prisma.user.delete({ where: { id: newCandidate.id } });
      });
    });

    describe('getApplicationById', () => {
      let applicationId: number;

      beforeEach(async () => {
        const app = await prisma.application.create({
          data: {
            jobId: openJobId,
            candidateId,
            resumeId,
            status: ApplicationStatus.APPLIED,
          },
        });
        applicationId = app.id;
      });

      it('should return application details', async () => {
        const result = await applicationsService.getApplicationById(
          candidateId,
          applicationId
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(applicationId);
        expect(result.candidateId).toBe(candidateId);
        expect(result.job).toBeDefined();
        expect(result.resume).toBeDefined();
      });

      it('should throw NotFoundException if application does not exist', async () => {
        await expect(
          applicationsService.getApplicationById(candidateId, 999999)
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException if application belongs to another candidate', async () => {
        await expect(
          applicationsService.getApplicationById(candidate2Id, applicationId)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('withdrawApplication', () => {
      let applicationId: number;

      beforeEach(async () => {
        const app = await prisma.application.create({
          data: {
            jobId: openJobId,
            candidateId,
            resumeId,
            status: ApplicationStatus.APPLIED,
          },
        });
        applicationId = app.id;
      });

      it('should withdraw application successfully', async () => {
        const result = await applicationsService.withdrawApplication(
          candidateId,
          applicationId
        );

        expect(result.status).toBe(ApplicationStatus.WITHDRAWN);
      });

      it('should throw NotFoundException if application does not exist', async () => {
        await expect(
          applicationsService.withdrawApplication(candidateId, 999999)
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException if application belongs to another candidate', async () => {
        await expect(
          applicationsService.withdrawApplication(candidate2Id, applicationId)
        ).rejects.toThrow(ForbiddenException);
      });

      it('should throw BadRequestException if status is not APPLIED', async () => {
        await prisma.application.update({
          where: { id: applicationId },
          data: { status: ApplicationStatus.INTERVIEW },
        });

        await expect(
          applicationsService.withdrawApplication(candidateId, applicationId)
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('Employer Operations', () => {
    describe('getApplicationsForEmployer', () => {
      beforeEach(async () => {
        // Create applications for employer's jobs
        await prisma.application.createMany({
          data: [
            {
              jobId: openJobId,
              candidateId,
              resumeId,
              status: ApplicationStatus.APPLIED,
            },
            {
              jobId: openJobId,
              candidateId: candidate2Id,
              resumeId: resume2Id,
              status: ApplicationStatus.INTERVIEW,
            },
            {
              jobId: employer2JobId,
              candidateId,
              resumeId,
              status: ApplicationStatus.APPLIED,
            },
          ],
        });
      });

      it('should return paginated list of applications for employer jobs', async () => {
        const result = await applicationsService.getApplicationsForEmployer(
          employerId,
          { page: 1, pageSize: 10 }
        );

        expect(result.applications).toHaveLength(2);
        expect(result.total).toBe(2);
        expect(result.applications[0].candidate).toBeDefined();
        expect(result.applications[0].candidate?.id).toBeTruthy();
      });

      it('should filter by jobId', async () => {
        const result = await applicationsService.getApplicationsForEmployer(
          employerId,
          { page: 1, pageSize: 10, jobId: openJobId }
        );

        expect(result.applications).toHaveLength(2);
        expect(
          result.applications.every((app) => app.jobId === openJobId)
        ).toBe(true);
      });

      it('should filter by status', async () => {
        const result = await applicationsService.getApplicationsForEmployer(
          employerId,
          { page: 1, pageSize: 10, status: ApplicationStatus.INTERVIEW }
        );

        expect(result.applications).toHaveLength(1);
        expect(result.applications[0].status).toBe(ApplicationStatus.INTERVIEW);
      });

      it('should filter by both jobId and status', async () => {
        const result = await applicationsService.getApplicationsForEmployer(
          employerId,
          {
            page: 1,
            pageSize: 10,
            jobId: openJobId,
            status: ApplicationStatus.APPLIED,
          }
        );

        expect(result.applications).toHaveLength(1);
        expect(result.applications[0].jobId).toBe(openJobId);
        expect(result.applications[0].status).toBe(ApplicationStatus.APPLIED);
      });

      it('should return empty list for employer with no applications', async () => {
        const result = await applicationsService.getApplicationsForEmployer(
          employer2Id,
          { page: 1, pageSize: 10, jobId: openJobId }
        );

        expect(result.applications).toHaveLength(0);
      });
    });

    describe('shortlistApplication', () => {
      let applicationId: number;

      beforeEach(async () => {
        const app = await prisma.application.create({
          data: {
            jobId: openJobId,
            candidateId,
            resumeId,
            status: ApplicationStatus.APPLIED,
          },
        });
        applicationId = app.id;
      });

      it('should shortlist application successfully', async () => {
        const result = await applicationsService.shortlistApplication(
          employerId,
          applicationId
        );

        expect(result.status).toBe(ApplicationStatus.INTERVIEW);
      });

      it('should throw NotFoundException if application does not exist', async () => {
        await expect(
          applicationsService.shortlistApplication(employerId, 999999)
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException if job belongs to another employer', async () => {
        await expect(
          applicationsService.shortlistApplication(employer2Id, applicationId)
        ).rejects.toThrow(ForbiddenException);
      });

      it('should throw BadRequestException if status is not APPLIED', async () => {
        await prisma.application.update({
          where: { id: applicationId },
          data: { status: ApplicationStatus.INTERVIEW },
        });

        await expect(
          applicationsService.shortlistApplication(employerId, applicationId)
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('rejectApplication', () => {
      let applicationId: number;
      let interviewApplicationId: number;

      beforeEach(async () => {
        const app = await prisma.application.create({
          data: {
            jobId: openJobId,
            candidateId,
            resumeId,
            status: ApplicationStatus.APPLIED,
          },
        });
        applicationId = app.id;

        const interviewApp = await prisma.application.create({
          data: {
            jobId: openJobId,
            candidateId: candidate2Id,
            resumeId: resume2Id,
            status: ApplicationStatus.INTERVIEW,
          },
        });
        interviewApplicationId = interviewApp.id;
      });

      it('should reject application with feedback (APPLIED status)', async () => {
        const result = await applicationsService.rejectApplication(
          employerId,
          applicationId,
          { feedback: 'Not qualified for the position' }
        );

        expect(result.status).toBe(ApplicationStatus.REJECTED);
        expect(result.aiFeedback).toBeDefined();
        expect(
          (result.aiFeedback as Record<string, unknown>).rejectionFeedback
        ).toBe('Not qualified for the position');
        expect(
          (result.aiFeedback as Record<string, unknown>).rejectedAt
        ).toBeDefined();
      });

      it('should reject application with feedback (INTERVIEW status)', async () => {
        const result = await applicationsService.rejectApplication(
          employerId,
          interviewApplicationId,
          { feedback: 'Failed technical interview' }
        );

        expect(result.status).toBe(ApplicationStatus.REJECTED);
        expect(
          (result.aiFeedback as Record<string, unknown>).rejectionFeedback
        ).toBe('Failed technical interview');
      });

      it('should throw NotFoundException if application does not exist', async () => {
        await expect(
          applicationsService.rejectApplication(employerId, 999999, {
            feedback: 'Test feedback',
          })
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException if job belongs to another employer', async () => {
        await expect(
          applicationsService.rejectApplication(employer2Id, applicationId, {
            feedback: 'Test feedback',
          })
        ).rejects.toThrow(ForbiddenException);
      });

      it('should throw BadRequestException if status is REJECTED', async () => {
        await prisma.application.update({
          where: { id: applicationId },
          data: { status: ApplicationStatus.REJECTED },
        });

        await expect(
          applicationsService.rejectApplication(employerId, applicationId, {
            feedback: 'Test feedback',
          })
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException if status is WITHDRAWN', async () => {
        await prisma.application.update({
          where: { id: applicationId },
          data: { status: ApplicationStatus.WITHDRAWN },
        });

        await expect(
          applicationsService.rejectApplication(employerId, applicationId, {
            feedback: 'Test feedback',
          })
        ).rejects.toThrow(BadRequestException);
      });

      it('should preserve existing aiFeedback when rejecting', async () => {
        await prisma.application.update({
          where: { id: applicationId },
          data: {
            aiFeedback: {
              existingData: 'test',
            },
          },
        });

        const result = await applicationsService.rejectApplication(
          employerId,
          applicationId,
          { feedback: 'Not suitable' }
        );

        expect(
          (result.aiFeedback as Record<string, unknown>).existingData
        ).toBe('test');
        expect(
          (result.aiFeedback as Record<string, unknown>).rejectionFeedback
        ).toBe('Not suitable');
      });
    });
  });

  // Cleanup after all tests
  afterAll(async () => {
    await prisma.application.deleteMany({
      where: {
        OR: [{ candidateId }, { candidateId: candidate2Id }],
      },
    });
    await prisma.resume.deleteMany({
      where: {
        OR: [{ id: resumeId }, { id: resume2Id }],
      },
    });
    await prisma.jobPosting.deleteMany({
      where: {
        id: {
          in: [openJobId, draftJobId, employer2JobId],
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [candidateId, candidate2Id, employerId, employer2Id],
        },
      },
    });
    await prisma.$disconnect();
  });
});
