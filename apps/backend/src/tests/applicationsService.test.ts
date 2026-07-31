import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApplicationsService } from '../app/applications/applications.service';
import { NotificationsService } from '../app/notifications/notifications.service';
import { PreShortlistService } from '../app/pre-shortlist/pre-shortlist.service';

// Mock ApplicationStatus enum from Prisma
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  PRE_SHORTLIST_PENDING = 'PRE_SHORTLIST_PENDING',
  PRE_SHORTLIST_SUBMITTED = 'PRE_SHORTLIST_SUBMITTED',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

// Mock @prisma/client module to include the enum
vi.mock('@prisma/client', () => ({
  ApplicationStatus: {
    APPLIED: 'APPLIED',
    PRE_SHORTLIST_PENDING: 'PRE_SHORTLIST_PENDING',
    PRE_SHORTLIST_SUBMITTED: 'PRE_SHORTLIST_SUBMITTED',
    INTERVIEW: 'INTERVIEW',
    OFFER: 'OFFER',
    REJECTED: 'REJECTED',
    WITHDRAWN: 'WITHDRAWN',
  },
  Prisma: {
    JsonNull: 'JsonNull',
  },
}));

// Helper to create complete mock application with all nested data
const createMockApplication = (overrides = {}) => ({
  id: 1,
  candidateId: 'candidate-123',
  jobId: 1,
  resumeId: 1,
  status: 'APPLIED' as ApplicationStatus,
  aiFeedback: {},
  matchPercentage: null,
  createdAt: new Date('2026-03-12T00:00:00Z'),
  updatedAt: new Date('2026-03-12T00:00:00Z'),
  job: {
    id: 1,
    title: 'Software Engineer',
    description: 'Test job description',
    status: 'OPEN',
    location: 'Remote',
    remote: true,
    type: 'FULL_TIME',
    company: {
      id: 1,
      name: 'Test Company',
      websiteUrl: null,
      sizeRange: null,
      industry: null,
      description: null,
      logoUrl: 'https://storage.example.com/company-logo.png',
    },
    salaryMin: 80000,
    salaryMax: 120000,
    currency: 'USD',
    postedById: 'employer-123',
    category: {
      id: 1,
      name: 'Engineering',
    },
    postedBy: {
      id: 'employer-123',
      name: 'Employer Name',
      email: 'employer@test.com',
    },
    _count: { preShortlistQuestions: 0 },
  },
  resume: {
    id: 1,
    candidateId: 'candidate-123',
    fileKey: 'resumes/test-resume.pdf',
    fileName: 'resume.pdf',
    fileType: 'application/pdf',
    fileSize: 245678,
    parsedText: 'Test resume content',
    aiScore: 85,
    isDefault: true,
  },
  candidate: {
    id: 'candidate-123',
    name: 'Candidate Name',
    email: 'candidate@test.com',
  },
  ...overrides,
});

// Mock Prisma client
const mockPrisma = vi.hoisted(() => ({
  jobPosting: {
    findUnique: vi.fn(),
  },
  resume: {
    findUnique: vi.fn(),
  },
  application: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  employer: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
}));

// Mock Notifications Service
const mockNotificationsService = vi.hoisted(() => ({
  createNotification: vi.fn(),
  createNotifications: vi.fn(),
}));

// Mock EventEmitter
const mockEventEmitter = vi.hoisted(() => ({
  emit: vi.fn(),
}));

// Mock PreShortlistService
const mockPreShortlistService = vi.hoisted(() => ({
  resolveInitialStatus: vi.fn().mockResolvedValue('APPLIED'),
  validateQuestions: vi.fn(),
  getQuestionsForJob: vi.fn(),
  getPreShortlistForApplication: vi.fn(),
  getStatusForApplication: vi.fn(),
  submitAnswers: vi.fn(),
  retryEvaluation: vi.fn(),
  buildPrompt: vi.fn(),
  persistEvaluation: vi.fn(),
  markEvaluationFailed: vi.fn(),
}));

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: mockPrisma,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: PreShortlistService,
          useValue: mockPreShortlistService,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    vi.clearAllMocks();
    mockPrisma.employer.findFirst.mockReset();

    // Manually assign dependencies as standard injection might fail in some test environments
    (service as any).prisma = mockPrisma;
    (service as any).notificationsService = mockNotificationsService;
    (service as any).eventEmitter = mockEventEmitter;
    (service as any).preShortlistService = mockPreShortlistService;
  });

  describe('createApplication', () => {
    it('should create a new application successfully', async () => {
      const mockApp = createMockApplication();

      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'candidate-123',
      });
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockApp);

      const result = await service.createApplication('candidate-123', {
        jobId: 1,
        resumeId: 1,
      });

      expect(result.status).toBe('APPLIED');
      expect(result.job.title).toBe('Software Engineer');
      expect(result.job.companyLogoUrl).toBe(
        'https://storage.example.com/company-logo.png'
      );
      expect(mockPrisma.application.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if job does not exist', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue(null);

      await expect(
        service.createApplication('candidate-123', {
          jobId: 999,
          resumeId: 1,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if job is not OPEN', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'CLOSED',
      });

      await expect(
        service.createApplication('candidate-123', {
          jobId: 1,
          resumeId: 1,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if resume does not exist', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue(null);

      await expect(
        service.createApplication('candidate-123', {
          jobId: 1,
          resumeId: 999,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if resume belongs to another candidate', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'another-candidate',
      });

      await expect(
        service.createApplication('candidate-123', {
          jobId: 1,
          resumeId: 1,
        })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException on duplicate application (APPLIED)', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'candidate-123',
      });
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 1,
        status: 'APPLIED' as ApplicationStatus,
      });

      await expect(
        service.createApplication('candidate-123', {
          jobId: 1,
          resumeId: 1,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if previous application was REJECTED', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'candidate-123',
      });
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 1,
        status: 'REJECTED' as ApplicationStatus,
      });

      await expect(
        service.createApplication('candidate-123', {
          jobId: 1,
          resumeId: 1,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow re-apply after WITHDRAWN (updates existing record)', async () => {
      const mockApp = createMockApplication({
        status: 'APPLIED' as ApplicationStatus,
      });

      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'candidate-123',
      });
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 1,
        status: 'WITHDRAWN' as ApplicationStatus,
      });
      mockPrisma.application.update.mockResolvedValue(mockApp);

      const result = await service.createApplication('candidate-123', {
        jobId: 1,
        resumeId: 1,
      });

      expect(result.status).toBe('APPLIED');
      expect(mockPrisma.application.update).toHaveBeenCalled();
    });
  });

  describe('createApplication with pre-shortlist', () => {
    it('returns APPLIED immediately and defers pre-shortlist resolution to the background worker', async () => {
      const mockApp = createMockApplication();
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'candidate-123',
      });
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockApp);

      const result = await service.createApplication('candidate-123', {
        jobId: 1,
        resumeId: 1,
      });

      // The POST returns synchronously with status APPLIED. The match-score
      // calculation and pre-shortlist status resolution are deferred to a
      // fire-and-forget background worker (calculateMatchScoreAndUpdateStatus)
      // so the slow LLM call does not block the request. The frontend polls
      // the application detail endpoint to surface the eventual status.
      expect(result.status).toBe('APPLIED');
    });
  });

  describe('listApplications', () => {
    it('should return paginated list of candidate applications', async () => {
      const mockApp = createMockApplication();
      mockPrisma.application.findMany.mockResolvedValue([mockApp]);
      mockPrisma.application.count.mockResolvedValue(1);

      const result = await service.listApplications('candidate-123', {
        page: 1,
        pageSize: 10,
      });

      expect(result).toBeDefined();
      expect(result.applications).toBeDefined();
      expect(result.applications).toHaveLength(1);
      expect(result.applications[0].job.title).toBe('Software Engineer');
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should filter applications by status', async () => {
      const mockApp = createMockApplication();
      mockPrisma.application.findMany.mockResolvedValue([mockApp]);
      mockPrisma.application.count.mockResolvedValue(1);

      await service.listApplications('candidate-123', {
        page: 1,
        pageSize: 10,
        status: 'APPLIED' as ApplicationStatus,
      });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            candidateId: 'candidate-123',
            status: 'APPLIED',
          }),
        })
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.application.count.mockResolvedValue(0);

      await service.listApplications('candidate-123', {
        page: 2,
        pageSize: 5,
      });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should return empty list for candidate with no applications', async () => {
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.application.count.mockResolvedValue(0);

      const result = await service.listApplications('candidate-123', {});

      expect(result.applications).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('exposes preShortlistQuestionsCount from job._count.preShortlistQuestions', async () => {
      const mockApp = createMockApplication({
        job: {
          ...createMockApplication().job,
          _count: { preShortlistQuestions: 3 },
        },
      });
      mockPrisma.application.findMany.mockResolvedValue([mockApp]);
      mockPrisma.application.count.mockResolvedValue(1);

      const result = await service.listApplications('candidate-123', {});

      expect(result.applications[0].preShortlistQuestionsCount).toBe(3);
    });

    it('defaults preShortlistQuestionsCount to 0 when _count is absent', async () => {
      const mockApp = createMockApplication({
        job: { ...createMockApplication().job, _count: undefined },
      });
      mockPrisma.application.findMany.mockResolvedValue([mockApp]);
      mockPrisma.application.count.mockResolvedValue(1);

      const result = await service.listApplications('candidate-123', {});

      expect(result.applications[0].preShortlistQuestionsCount).toBe(0);
    });
  });

  describe('getApplicationById', () => {
    it('should return application details', async () => {
      const mockApp = createMockApplication();
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      const result = await service.getApplicationById('candidate-123', 1);

      expect(result.id).toBe(1);
      expect(result.status).toBe('APPLIED');
      expect(result.job.title).toBe('Software Engineer');
    });

    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.getApplicationById('candidate-123', 999)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if application belongs to another candidate', async () => {
      const mockApp = createMockApplication({
        candidateId: 'another-candidate',
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.getApplicationById('candidate-123', 1)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('withdrawApplication', () => {
    it('should withdraw application successfully', async () => {
      const mockApp = createMockApplication({
        status: 'APPLIED' as ApplicationStatus,
      });
      const withdrawnApp = createMockApplication({
        status: 'WITHDRAWN' as ApplicationStatus,
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(withdrawnApp);

      const result = await service.withdrawApplication('candidate-123', 1);

      expect(result.status).toBe('WITHDRAWN');
      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            status: 'WITHDRAWN',
          }),
        })
      );
    });

    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.withdrawApplication('candidate-123', 999)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if application belongs to another candidate', async () => {
      const mockApp = createMockApplication({
        candidateId: 'another-candidate',
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.withdrawApplication('candidate-123', 1)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if status is terminal', async () => {
      const mockApp = createMockApplication({
        status: 'OFFER' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.withdrawApplication('candidate-123', 1)
      ).rejects.toThrow(BadRequestException);
    });

    it('should withdraw application from PRE_SHORTLIST_PENDING', async () => {
      const mockApp = createMockApplication({
        status: 'PRE_SHORTLIST_PENDING' as ApplicationStatus,
      });
      const withdrawnApp = createMockApplication({
        status: 'WITHDRAWN' as ApplicationStatus,
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(withdrawnApp);

      const result = await service.withdrawApplication('candidate-123', 1);
      expect(result.status).toBe('WITHDRAWN');
    });

    it('should withdraw application from PRE_SHORTLIST_SUBMITTED', async () => {
      const mockApp = createMockApplication({
        status: 'PRE_SHORTLIST_SUBMITTED' as ApplicationStatus,
      });
      const withdrawnApp = createMockApplication({
        status: 'WITHDRAWN' as ApplicationStatus,
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(withdrawnApp);

      const result = await service.withdrawApplication('candidate-123', 1);
      expect(result.status).toBe('WITHDRAWN');
    });

    it('should withdraw application from INTERVIEW', async () => {
      const mockApp = createMockApplication({
        status: 'INTERVIEW' as ApplicationStatus,
      });
      const withdrawnApp = createMockApplication({
        status: 'WITHDRAWN' as ApplicationStatus,
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(withdrawnApp);

      const result = await service.withdrawApplication('candidate-123', 1);
      expect(result.status).toBe('WITHDRAWN');
    });
  });

  describe('getApplicationsForEmployer', () => {
    it('should return paginated list of applications for employer jobs', async () => {
      const mockApp = createMockApplication();
      mockPrisma.employer.findUnique.mockResolvedValue({ id: 'employer-123' });
      mockPrisma.application.findMany.mockResolvedValue([mockApp]);
      mockPrisma.application.count.mockResolvedValue(1);

      const result = await service.getApplicationsForEmployer('employer-123', {
        page: 1,
        pageSize: 10,
      });

      expect(result.applications).toHaveLength(1);
      expect(result.applications[0]?.candidate?.name).toBe('Candidate Name');
      expect(result.total).toBe(1);
    });

    it('should filter by jobId', async () => {
      const mockApp = createMockApplication();
      mockPrisma.employer.findUnique.mockResolvedValue({ id: 'employer-123' });
      mockPrisma.application.findMany.mockResolvedValue([mockApp]);
      mockPrisma.application.count.mockResolvedValue(1);

      await service.getApplicationsForEmployer('employer-123', {
        page: 1,
        pageSize: 10,
        jobId: 1,
      });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            job: expect.objectContaining({
              id: 1,
              postedById: 'employer-123',
            }),
          }),
        })
      );
    });

    it('should filter by status', async () => {
      const mockApp = createMockApplication();
      mockPrisma.employer.findUnique.mockResolvedValue({ id: 'employer-123' });
      mockPrisma.application.findMany.mockResolvedValue([mockApp]);
      mockPrisma.application.count.mockResolvedValue(1);

      await service.getApplicationsForEmployer('employer-123', {
        page: 1,
        pageSize: 10,
        status: 'APPLIED' as ApplicationStatus,
      });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPLIED',
          }),
        })
      );
    });

    it('should filter by both jobId and status', async () => {
      const mockApp = createMockApplication();
      mockPrisma.employer.findUnique.mockResolvedValue({ id: 'employer-123' });
      mockPrisma.application.findMany.mockResolvedValue([mockApp]);
      mockPrisma.application.count.mockResolvedValue(1);

      await service.getApplicationsForEmployer('employer-123', {
        page: 1,
        pageSize: 10,
        jobId: 1,
        status: 'APPLIED' as ApplicationStatus,
      });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            job: expect.objectContaining({
              id: 1,
              postedById: 'employer-123',
            }),
            status: 'APPLIED',
          }),
        })
      );
    });

    it('should return empty list for employer with no applications', async () => {
      mockPrisma.employer.findUnique.mockResolvedValue({ id: 'employer-123' });
      mockPrisma.application.findMany.mockResolvedValue([]);
      mockPrisma.application.count.mockResolvedValue(0);

      const result = await service.getApplicationsForEmployer(
        'employer-123',
        {}
      );

      expect(result.applications).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('shortlistApplication', () => {
    it('should shortlist application successfully', async () => {
      const mockApp = createMockApplication({
        status: 'APPLIED' as ApplicationStatus,
      });
      const shortlistedApp = createMockApplication({
        status: 'INTERVIEW' as ApplicationStatus,
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(shortlistedApp);

      const result = await service.shortlistApplication('employer-123', 1);

      expect(result.status).toBe('INTERVIEW');
      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            status: 'INTERVIEW',
          }),
        })
      );
    });

    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.shortlistApplication('employer-123', 999)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if job belongs to another employer', async () => {
      const mockApp = createMockApplication();
      mockApp.job.postedById = 'another-employer';
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.shortlistApplication('employer-123', 1)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if status is not APPLIED', async () => {
      const mockApp = createMockApplication({
        status: 'INTERVIEW' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.shortlistApplication('employer-123', 1)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectApplication', () => {
    it('should reject application with feedback (APPLIED status)', async () => {
      const mockApp = createMockApplication({
        status: 'APPLIED' as ApplicationStatus,
      });
      const rejectedApp = createMockApplication({
        status: 'REJECTED' as ApplicationStatus,
        aiFeedback: { rejectionFeedback: 'Not qualified' },
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(rejectedApp);

      const result = await service.rejectApplication('employer-123', 1, {
        feedback: 'Not qualified',
      });

      expect(result.status).toBe('REJECTED');
      expect(mockPrisma.application.update).toHaveBeenCalled();
    });

    it('should reject application with feedback (INTERVIEW status)', async () => {
      const mockApp = createMockApplication({
        status: 'INTERVIEW' as ApplicationStatus,
      });
      const rejectedApp = createMockApplication({
        status: 'REJECTED' as ApplicationStatus,
        aiFeedback: { rejectionFeedback: 'Failed interview' },
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(rejectedApp);

      const result = await service.rejectApplication('employer-123', 1, {
        feedback: 'Failed interview',
      });

      expect(result.status).toBe('REJECTED');
    });

    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.rejectApplication('employer-123', 999, {
          feedback: 'Test',
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if job belongs to another employer', async () => {
      const mockApp = createMockApplication();
      mockApp.job.postedById = 'another-employer';
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.rejectApplication('employer-123', 1, {
          feedback: 'Test',
        })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if status is REJECTED', async () => {
      const mockApp = createMockApplication({
        status: 'REJECTED' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.rejectApplication('employer-123', 1, {
          feedback: 'Test',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if status is WITHDRAWN', async () => {
      const mockApp = createMockApplication({
        status: 'WITHDRAWN' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.rejectApplication('employer-123', 1, {
          feedback: 'Test',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should preserve existing aiFeedback when rejecting', async () => {
      const mockApp = createMockApplication({
        status: 'APPLIED' as ApplicationStatus,
        aiFeedback: { existingField: 'value' },
      });
      const rejectedApp = createMockApplication({
        status: 'REJECTED' as ApplicationStatus,
        aiFeedback: {
          existingField: 'value',
          rejectionFeedback: 'Not qualified',
        },
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(rejectedApp);

      await service.rejectApplication('employer-123', 1, {
        feedback: 'Not qualified',
      });

      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            status: 'REJECTED',
            aiFeedback: expect.objectContaining({
              existingField: 'value',
              rejectionFeedback: 'Not qualified',
            }),
          }),
        })
      );
    });
  });

  describe('moveToOfferApplication', () => {
    it('should move application from INTERVIEW to OFFER successfully', async () => {
      const mockApp = createMockApplication({
        status: 'INTERVIEW' as ApplicationStatus,
      });
      const offerApp = createMockApplication({
        status: 'OFFER' as ApplicationStatus,
      });

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.application.update.mockResolvedValue(offerApp);

      const result = await service.moveToOfferApplication('employer-123', 1);

      expect(result.status).toBe('OFFER');
      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            status: 'OFFER',
          }),
        })
      );
    });

    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.moveToOfferApplication('employer-123', 999)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if job belongs to another employer', async () => {
      const mockApp = createMockApplication({
        status: 'INTERVIEW' as ApplicationStatus,
      });
      mockApp.job.postedById = 'another-employer';
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.moveToOfferApplication('employer-123', 1)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if status is APPLIED', async () => {
      const mockApp = createMockApplication({
        status: 'APPLIED' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.moveToOfferApplication('employer-123', 1)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if status is OFFER', async () => {
      const mockApp = createMockApplication({
        status: 'OFFER' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.moveToOfferApplication('employer-123', 1)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if status is REJECTED', async () => {
      const mockApp = createMockApplication({
        status: 'REJECTED' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.moveToOfferApplication('employer-123', 1)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if status is WITHDRAWN', async () => {
      const mockApp = createMockApplication({
        status: 'WITHDRAWN' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.moveToOfferApplication('employer-123', 1)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createApplication - job.viewed emission', () => {
    it('emits job.viewed once when creating a new application', async () => {
      const mockApp = createMockApplication();
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'candidate-123',
      });
      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockApp);

      await service.createApplication('candidate-123', {
        jobId: 1,
        resumeId: 1,
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('job.viewed', {
        jobId: 1,
      });
    });

    it('emits job.viewed once when re-activating a WITHDRAWN application', async () => {
      const mockApp = createMockApplication();
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'candidate-123',
      });
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 1,
        status: 'WITHDRAWN',
      });
      mockPrisma.application.update.mockResolvedValue(mockApp);

      await service.createApplication('candidate-123', {
        jobId: 1,
        resumeId: 1,
      });

      expect(mockPrisma.application.update).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('job.viewed', {
        jobId: 1,
      });
    });

    it('does not emit when the job is not OPEN', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'CLOSED',
      });

      await expect(
        service.createApplication('candidate-123', { jobId: 1, resumeId: 1 })
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('does not emit when the job is not found', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue(null);

      await expect(
        service.createApplication('candidate-123', { jobId: 1, resumeId: 1 })
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('does not emit when the resume does not belong to the candidate', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'someone-else',
      });

      await expect(
        service.createApplication('candidate-123', { jobId: 1, resumeId: 1 })
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('does not emit when an active application already exists', async () => {
      mockPrisma.jobPosting.findUnique.mockResolvedValue({
        id: 1,
        status: 'OPEN',
      });
      mockPrisma.resume.findUnique.mockResolvedValue({
        id: 1,
        candidateId: 'candidate-123',
      });
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 1,
        status: 'APPLIED',
      });

      await expect(
        service.createApplication('candidate-123', { jobId: 1, resumeId: 1 })
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('getApplicationByIdForEmployer', () => {
    it('should return application details for the owning employer', async () => {
      const mockApp = createMockApplication();
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      const result = await service.getApplicationByIdForEmployer(
        'employer-123',
        1
      );

      expect(result.id).toBe(1);
      expect(result.status).toBe('APPLIED');
      expect(result.job.title).toBe('Software Engineer');
    });

    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.getApplicationByIdForEmployer('employer-123', 999)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if job is owned by another employer', async () => {
      const mockApp = createMockApplication();
      mockApp.job.postedById = 'another-employer';
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.getApplicationByIdForEmployer('employer-123', 1)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
