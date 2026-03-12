import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApplicationsService } from '../app/applications/applications.service';

// Mock ApplicationStatus enum from Prisma
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

// Mock @prisma/client module to include the enum
vi.mock('@prisma/client', () => ({
  ApplicationStatus: {
    APPLIED: 'APPLIED',
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
    companyName: 'Test Company',
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
  },
  resume: {
    id: 1,
    fileUrl: 'https://example.com/resume.pdf',
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
  },
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
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    vi.clearAllMocks();
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

    it('should throw BadRequestException if status is not APPLIED', async () => {
      const mockApp = createMockApplication({
        status: 'INTERVIEW' as ApplicationStatus,
      });
      mockPrisma.application.findUnique.mockResolvedValue(mockApp);

      await expect(
        service.withdrawApplication('candidate-123', 1)
      ).rejects.toThrow(BadRequestException);
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
});
