import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RequirementImportance, EmploymentType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobsService } from '../app/jobs/jobs.service';

const mockJobDbRecord = vi.hoisted(() => ({
  id: 1,
  title: 'Software Engineer',
  description: 'Great job',
  location: 'Remote',
  remote: true,
  type: 'FULL_TIME',
  salaryMin: 50000,
  salaryMax: 100000,
  categoryId: 1,
  companyId: 1,
  postedById: 'employer123',
  status: 'OPEN',
  createdAt: new Date(),
  updatedAt: new Date(),
  category: { id: 1, name: 'Engineering' },
  company: {
    id: 1,
    name: 'Tech Corp',
    websiteUrl: null,
    sizeRange: null,
    industry: null,
    description: null,
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  requirements: [
    { skill: { name: 'TypeScript' } },
    { skill: { name: 'NestJS' } },
  ],
  _count: {
    applications: 5,
  },
}));

const mockPrisma = vi.hoisted(() => ({
  jobPosting: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  application: {
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const mockEventEmitter = vi.hoisted(() => ({
  emit: vi.fn(),
}));

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: mockPrisma,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    (service as any).eventEmitter = mockEventEmitter;
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getJobById', () => {
    it('should return a mapped job when found', async () => {
      // Arrange
      mockPrisma.jobPosting.findFirst.mockResolvedValue(mockJobDbRecord);

      // Act
      const result = await service.getJobById(1);

      // Assert
      expect(mockPrisma.jobPosting.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
        include: expect.any(Object), // We use expect.any(Object) to avoid hardcoding the entire include object
      });

      // Verify mapToJobResponse worked correctly
      expect(result.employerId).toBe('employer123');
      expect(result.requirements).toHaveLength(2);
      expect(result.requirements[0].skillName).toBe('TypeScript');
      expect(result.requirements[1].skillName).toBe('NestJS');
      expect(result).not.toHaveProperty('postedById');
    });

    it('should throw NotFoundException when job is not found', async () => {
      // Arrange
      mockPrisma.jobPosting.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getJobById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createJob', () => {
    it('should create and return a mapped job', async () => {
      // Arrange
      const createDto = {
        title: 'Software Engineer',
        description: 'Great job',
        location: 'Remote',
        remote: true,
        type: 'FULL_TIME' as const,
        categoryId: 1,
        companyId: 1,
        salaryMin: 50000,
        salaryMax: 100000,
        requirements: [
          {
            skillId: 10,
            importance: 'REQUIRED' as RequirementImportance,
            minYearsExperience: 2,
          },
        ],
      };

      const userId = 'employer123';

      mockPrisma.jobPosting.create.mockResolvedValue(mockJobDbRecord);

      // Act
      const result = await service.createJob(createDto, userId);

      // Assert
      expect(mockPrisma.jobPosting.create).toHaveBeenCalledWith({
        data: {
          title: 'Software Engineer',
          description: 'Great job',
          location: 'Remote',
          remote: true,
          type: 'FULL_TIME',
          categoryId: 1,
          companyId: 1,
          salaryMin: 50000,
          salaryMax: 100000,
          postedById: userId,
          requirements: {
            create: [
              { skillId: 10, importance: 'REQUIRED', minYearsExperience: 2 },
            ],
          },
        },
        include: expect.any(Object),
      });

      // Verify mapping worked
      expect(result.employerId).toBe(userId);
      expect(result.requirements).toHaveLength(2);
      expect(result.requirements[0].skillName).toBe('TypeScript');
      expect(result.requirements[1].skillName).toBe('NestJS');
      expect(result).not.toHaveProperty('postedById');
    });

    it('should handle creation without requirements and map null salaries correctly', async () => {
      // Arrange
      const createDto = {
        title: 'Backend Dev',
        description: 'No requirements needed',
        location: 'Remote',
        remote: true,
        type: 'CONTRACT' as EmploymentType,
        categoryId: 2,
        companyId: 1,
        // Notice no salaryMin, salaryMax, or requirements
      };

      const dbRecordWithoutReqs = {
        ...mockJobDbRecord,
        requirements: undefined,
        salaryMin: null,
        salaryMax: null,
      };
      mockPrisma.jobPosting.create.mockResolvedValue(dbRecordWithoutReqs);

      // Act
      const result = await service.createJob(createDto, 'employer123');

      // Assert: Verify Prisma wasn't told to create requirements
      expect(mockPrisma.jobPosting.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            requirements: expect.anything(),
          }),
        })
      );

      // Assert: Verify mapToJobResponse handled the missing/null data
      expect(result.requirements).toEqual([]); // Should default to empty array
      expect(result.salaryMin).toBeNull();
      expect(result.salaryMax).toBeNull();
    });
  });

  describe('deleteJobById', () => {
    it('should delete the job if the user is the original poster', async () => {
      // Arrange
      mockPrisma.jobPosting.findUnique.mockResolvedValue(mockJobDbRecord); // postedById is 'employer123'
      mockPrisma.jobPosting.update.mockResolvedValue(mockJobDbRecord);
      mockPrisma.application.updateMany.mockResolvedValue({ count: 0 });

      // Act
      await service.deleteJobById(1, 'employer123', 'employer');

      // Assert
      expect(mockPrisma.jobPosting.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'CLOSED',
          deletedAt: expect.any(Date),
        }),
      });
    });

    it('should delete the job if the user is an admin', async () => {
      // Arrange
      mockPrisma.jobPosting.findUnique.mockResolvedValue(mockJobDbRecord);
      mockPrisma.jobPosting.update.mockResolvedValue(mockJobDbRecord);
      mockPrisma.application.updateMany.mockResolvedValue({ count: 0 });

      // Act
      await service.deleteJobById(1, 'some_other_user', 'admin');

      // Assert
      expect(mockPrisma.jobPosting.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'CLOSED',
          deletedAt: expect.any(Date),
        }),
      });
    });

    it('should throw ForbiddenException if user is not the poster and not an admin', async () => {
      // Arrange
      mockPrisma.jobPosting.findUnique.mockResolvedValue(mockJobDbRecord);

      // Act & Assert
      await expect(
        service.deleteJobById(1, 'hacker_user', 'candidate')
      ).rejects.toThrow(ForbiddenException);

      // Ensure delete was never called
      expect(mockPrisma.jobPosting.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if job does not exist', async () => {
      // Arrange
      mockPrisma.jobPosting.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.deleteJobById(99, 'employer123', 'employer')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateJobById', () => {
    it('should update and return a mapped job when user is the original poster', async () => {
      // Arrange
      mockPrisma.jobPosting.findFirst.mockResolvedValue(mockJobDbRecord); // postedById is 'employer123'

      // We simulate the DB returning the updated record
      const updatedDbRecord = {
        ...mockJobDbRecord,
        title: 'Senior Software Engineer',
      };
      mockPrisma.jobPosting.update.mockResolvedValue(updatedDbRecord);

      const updateDto = {
        title: 'Senior Software Engineer',
        requirements: [
          {
            skillId: 20,
            importance: 'REQUIRED' as RequirementImportance,
            minYearsExperience: 5,
          },
        ],
      };

      // Act
      const result = await service.updateJobById(
        1,
        updateDto,
        'employer123',
        'employer'
      );

      // Assert
      expect(mockPrisma.jobPosting.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Senior Software Engineer',
          requirements: {
            deleteMany: {},
            create: [
              { skillId: 20, importance: 'REQUIRED', minYearsExperience: 5 },
            ],
          },
        },
        include: expect.any(Object),
      });
      expect(result.title).toBe('Senior Software Engineer');
      expect(result.employerId).toBe('employer123');
    });

    it('should allow an admin to update the job', async () => {
      // Arrange
      mockPrisma.jobPosting.findFirst.mockResolvedValue(mockJobDbRecord);
      mockPrisma.jobPosting.update.mockResolvedValue(mockJobDbRecord);

      // Act
      await service.updateJobById(
        1,
        { title: 'Changed' },
        'some_admin',
        'admin'
      );

      // Assert
      expect(mockPrisma.jobPosting.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not poster and not admin', async () => {
      // Arrange
      mockPrisma.jobPosting.findFirst.mockResolvedValue(mockJobDbRecord);

      // Act & Assert
      await expect(
        service.updateJobById(
          1,
          { title: 'Hacked' },
          'sneaky_user',
          'candidate'
        )
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.jobPosting.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if job does not exist', async () => {
      // Arrange
      mockPrisma.jobPosting.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateJobById(
          99,
          { title: 'Ghost Job' },
          'employer123',
          'employer'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should perform a partial update without changing requirements if omitted', async () => {
      // Arrange
      mockPrisma.jobPosting.findFirst.mockResolvedValue(mockJobDbRecord);
      mockPrisma.jobPosting.update.mockResolvedValue(mockJobDbRecord);

      // Act
      await service.updateJobById(
        1,
        { title: 'New Title' },
        'employer123',
        'employer'
      );

      // Assert
      expect(mockPrisma.jobPosting.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            requirements: expect.anything(),
          }),
        })
      );
    });
  });

  describe('getsPaginatedJobsPostings', () => {
    it('should return paginated jobs with correct total pages calculation', async () => {
      // Arrange
      const query = {
        page: 2,
        pageSize: 5,
        q: 'Engineer',
        type: ['FULL_TIME' as EmploymentType],
      };

      // Mock the transaction to return an array containing [count, records]
      // Let's pretend there are 12 total records in the DB matching the query
      mockPrisma.$transaction.mockResolvedValue([12, [mockJobDbRecord]]);

      // Act
      const result = await service.getsPaginatedJobsPostings(query);

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalled(); // Ensure the transaction ran

      // Verify pagination math (12 total items / 5 per page = 3 pages)
      expect(result).toEqual({
        jobs: [
          expect.objectContaining({
            id: 1,
            employerId: 'employer123',
            title: 'Software Engineer',
          }),
        ],
        total: 12,
        page: 2,
        pageSize: 5,
        totalPages: 3,
      });
    });

    it('should build the correct whereClause based on query parameters', async () => {
      // Arrange
      const query = { q: 'React', location: 'New York', remote: false };
      mockPrisma.$transaction.mockResolvedValue([1, [mockJobDbRecord]]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      // We grab the arguments passed to Prisma's count method inside the transaction
      // to verify our whereClause builder logic is working
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];

      expect(countArgs.where).toEqual(
        expect.objectContaining({
          OR: [
            { title: { contains: 'React', mode: 'insensitive' } },
            { description: { contains: 'React', mode: 'insensitive' } },
          ],
          location: { contains: 'New York', mode: 'insensitive' },
          remote: false,
        })
      );
    });

    it('should build whereClause with skills filtering', async () => {
      // Arrange
      const query = { skills: ['TypeScript', 'NestJS'] };
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];
      expect(countArgs.where.requirements).toEqual({
        some: { skill: { name: { in: ['TypeScript', 'NestJS'] } } },
      });
    });

    it('should build whereClause with complex null-safe salary range filtering', async () => {
      // Arrange
      const query = { salaryMin: 60000, salaryMax: 120000 };
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0]; // Grabbing the latest call
      expect(countArgs.where.AND).toEqual([
        { OR: [{ salaryMax: { gte: 60000 } }, { salaryMax: null }] },
        { OR: [{ salaryMin: { lte: 120000 } }, { salaryMin: null }] },
      ]);
    });

    it('should use default page and pageSize if not provided', async () => {
      // Arrange
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings({}); // Empty query

      // Assert
      const findArgs = mockPrisma.jobPosting.findMany.mock.calls[0][0];
      expect(findArgs.skip).toBe(0); // (1 - 1) * 10 = 0
      expect(findArgs.take).toBe(10); // Default pageSize
    });
  });

  describe('getJobsByUserId', () => {
    it('should return paginated jobs for a specific user', async () => {
      // Arrange
      // Mock the transaction to return an array containing [total count, records]
      mockPrisma.$transaction.mockResolvedValue([1, [mockJobDbRecord]]);

      // Act
      const result = await service.getJobsByUserId('employer123');

      // Assert
      expect(mockPrisma.$transaction).toHaveBeenCalled();

      // Verify the response structure
      expect(result).toEqual({
        jobs: [
          expect.objectContaining({
            employerId: 'employer123',
            title: 'Software Engineer',
          }),
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });

    it('should support pagination query parameters for user jobs', async () => {
      // Arrange
      mockPrisma.$transaction.mockResolvedValue([25, [mockJobDbRecord]]);

      // Act
      const result = await service.getJobsByUserId('employer123', {
        page: 2,
        pageSize: 10,
      });

      // Assert
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3); // Math.ceil(25 / 10) = 3
    });
  });

  describe('getJobsByCategoryId', () => {
    it('should return mapped jobs for a specific category', async () => {
      // Arrange
      mockPrisma.jobPosting.findMany.mockResolvedValue([mockJobDbRecord]);

      // Act
      const result = await service.getJobsByCategoryId(1);

      // Assert
      expect(mockPrisma.jobPosting.findMany).toHaveBeenCalledWith({
        where: { categoryId: 1, status: 'OPEN', deletedAt: null },
        include: expect.any(Object),
      });
      expect(result).toHaveLength(1);
      expect(result[0].category.id).toBe(1);
    });
  });

  describe('getsPaginatedJobsPostings', () => {
    const baseQuery = { page: 1, pageSize: 10 } as any;

    it('emits job.viewed once per returned job', async () => {
      const rows = [
        { ...mockJobDbRecord, id: 1 },
        { ...mockJobDbRecord, id: 2 },
        { ...mockJobDbRecord, id: 3 },
      ];
      mockPrisma.$transaction.mockResolvedValue([3, rows]);

      const result = await service.getsPaginatedJobsPostings(baseQuery);

      expect(result.jobs).toHaveLength(3);
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(3);
      expect(mockEventEmitter.emit).toHaveBeenNthCalledWith(1, 'job.viewed', {
        jobId: 1,
      });
      expect(mockEventEmitter.emit).toHaveBeenNthCalledWith(2, 'job.viewed', {
        jobId: 2,
      });
      expect(mockEventEmitter.emit).toHaveBeenNthCalledWith(3, 'job.viewed', {
        jobId: 3,
      });
    });

    it('does not emit when the result set is empty', async () => {
      mockPrisma.$transaction.mockResolvedValue([0, []]);
      await service.getsPaginatedJobsPostings(baseQuery);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('still returns the paginated response when the emitter throws', async () => {
      mockEventEmitter.emit.mockImplementation(() => {
        throw new Error('emitter broken');
      });
      const rows = [{ ...mockJobDbRecord, id: 1 }];
      mockPrisma.$transaction.mockResolvedValue([1, rows]);

      const result = await service.getsPaginatedJobsPostings(baseQuery);

      expect(result.jobs).toHaveLength(1);
    });
  });
});
