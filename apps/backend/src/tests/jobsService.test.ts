import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RequirementImportance, EmploymentType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JobsService } from '../app/jobs/jobs.service';
import { GetJobsQueryDTO } from '../app/jobs/dto/getJobsQueryDTO';
import { PreShortlistService } from '../app/pre-shortlist/pre-shortlist.service';
import { LocationService } from '../app/location/location.service';

const mockJobDbRecord = vi.hoisted(() => ({
  id: 1,
  title: 'Software Engineer',
  description: 'Great job',
  location: {
    id: 'loc1',
    provider: 'manual',
    providerId: 'Remote',
    formattedAddress: 'Remote',
    lat: 0,
    lng: 0,
    city: null,
    state: null,
    country: null,
    postcode: null,
  },
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
  jobView: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const mockEventEmitter = vi.hoisted(() => ({
  emit: vi.fn(),
}));

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

const mockLocationService = vi.hoisted(() => ({
  getOrCreateLocation: vi.fn(),
  autocomplete: vi.fn(),
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
        {
          provide: PreShortlistService,
          useValue: mockPreShortlistService,
        },
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    (service as unknown as { eventEmitter: EventEmitter2 }).eventEmitter =
      mockEventEmitter as unknown as EventEmitter2;
    (
      service as unknown as { preShortlistService: PreShortlistService }
    ).preShortlistService =
      mockPreShortlistService as unknown as PreShortlistService;
    (
      service as unknown as { locationService: LocationService }
    ).locationService = mockLocationService as unknown as LocationService;
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
        location: {
          provider: 'manual',
          providerId: 'Remote',
          formattedAddress: 'Remote',
          lat: 0,
          lng: 0,
        },
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

      mockLocationService.getOrCreateLocation.mockResolvedValue({ id: 'loc1' });
      mockPrisma.jobPosting.create.mockResolvedValue(mockJobDbRecord);

      // Act
      const result = await service.createJob(createDto, userId);

      // Assert
      expect(mockPrisma.jobPosting.create).toHaveBeenCalledWith({
        data: {
          title: 'Software Engineer',
          description: 'Great job',
          locationId: 'loc1',
          remote: true,
          type: 'FULL_TIME',
          categoryId: 1,
          companyId: 1,
          salaryMin: 50000,
          salaryMax: 100000,
          postedById: userId,
          preShortlistThreshold: 0,
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
        location: {
          provider: 'manual',
          providerId: 'Remote',
          formattedAddress: 'Remote',
          lat: 0,
          lng: 0,
        },
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
      mockLocationService.getOrCreateLocation.mockResolvedValue({ id: 'loc1' });
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
          AND: expect.arrayContaining([
            {
              OR: [
                { title: { contains: 'React', mode: 'insensitive' } },
                { description: { contains: 'React', mode: 'insensitive' } },
                {
                  company: {
                    name: { contains: 'React', mode: 'insensitive' },
                  },
                },
              ],
            },
          ]),
          location: {
            formattedAddress: { contains: 'New York', mode: 'insensitive' },
          },
          remote: false,
        })
      );
    });

    it('should split location query by comma and search using the first part', async () => {
      // Arrange
      const query = { location: 'Da Nang, Vietnam' };
      mockPrisma.$transaction.mockResolvedValue([1, [mockJobDbRecord]]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];
      expect(countArgs.where.location).toEqual({
        formattedAddress: { contains: 'Da Nang', mode: 'insensitive' },
      });
    });

    it('should split multiple search terms by whitespace, normalize multiple spaces, and query in any order', async () => {
      // Arrange
      const query = { q: '  React   Senior  Developer  ' };
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];
      expect(countArgs.where.AND).toEqual(
        expect.arrayContaining([
          {
            OR: [
              { title: { contains: 'React', mode: 'insensitive' } },
              { description: { contains: 'React', mode: 'insensitive' } },
              { company: { name: { contains: 'React', mode: 'insensitive' } } },
            ],
          },
          {
            OR: [
              { title: { contains: 'Senior', mode: 'insensitive' } },
              { description: { contains: 'Senior', mode: 'insensitive' } },
              {
                company: { name: { contains: 'Senior', mode: 'insensitive' } },
              },
            ],
          },
          {
            OR: [
              { title: { contains: 'Developer', mode: 'insensitive' } },
              { description: { contains: 'Developer', mode: 'insensitive' } },
              {
                company: {
                  name: { contains: 'Developer', mode: 'insensitive' },
                },
              },
            ],
          },
        ])
      );
    });

    it('should preserve literal plus signs like in C++ and split multiple keywords correctly', async () => {
      // Arrange
      const query = { q: 'C++ Developer' };
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];
      expect(countArgs.where.AND).toEqual(
        expect.arrayContaining([
          {
            OR: [
              { title: { contains: 'C++', mode: 'insensitive' } },
              { description: { contains: 'C++', mode: 'insensitive' } },
              { company: { name: { contains: 'C++', mode: 'insensitive' } } },
            ],
          },
          {
            OR: [
              { title: { contains: 'Developer', mode: 'insensitive' } },
              { description: { contains: 'Developer', mode: 'insensitive' } },
              {
                company: {
                  name: { contains: 'Developer', mode: 'insensitive' },
                },
              },
            ],
          },
        ])
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

    it('should add currency condition to AND array when currency is provided', async () => {
      // Arrange
      const query = {
        salaryMin: 50000000,
        salaryMax: 80000000,
        currency: 'VND',
      };
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];
      expect(countArgs.where.AND).toEqual(
        expect.arrayContaining([
          { OR: [{ salaryMax: { gte: 50000000 } }, { salaryMax: null }] },
          { OR: [{ salaryMin: { lte: 80000000 } }, { salaryMin: null }] },
          { currency: 'VND' },
        ])
      );
    });

    it('should add currency condition alone when no salary range is provided', async () => {
      // Arrange
      const query = { currency: 'VND' };
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];
      expect(countArgs.where.AND).toEqual([{ currency: 'VND' }]);
    });

    it('should NOT add currency condition when currency is not provided', async () => {
      // Arrange
      const query = { salaryMin: 60000, salaryMax: 120000 };
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];
      // AND should only have the two salary conditions, no currency
      expect(countArgs.where.AND).toHaveLength(2);
      expect(countArgs.where.AND).not.toContainEqual({
        currency: expect.anything(),
      });
    });

    it('should NOT add AND conditions when no salary and no currency are provided', async () => {
      // Arrange — default-off state: no salary params at all
      const query = { page: 1, pageSize: 10 };
      mockPrisma.$transaction.mockResolvedValue([0, []]);

      // Act
      await service.getsPaginatedJobsPostings(query);

      // Assert
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];
      // No AND array should exist — nothing to filter beyond status:'OPEN'
      expect(countArgs.where.AND).toBeUndefined();
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
    const baseQuery: GetJobsQueryDTO = { page: 1, pageSize: 10 };

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

  describe('getJobViewsAnalyticsForJob', () => {
    const start = new Date('2026-06-01T00:00:00.000');
    const end = new Date('2026-06-07T23:59:59.999');

    it('returns totalViews and a series bucketed by day for the job', async () => {
      mockPrisma.jobView.findMany.mockResolvedValue([
        { jobId: 42, viewedAt: new Date('2026-06-02T10:00:00.000') },
        { jobId: 42, viewedAt: new Date('2026-06-02T15:00:00.000') },
        { jobId: 42, viewedAt: new Date('2026-06-05T09:00:00.000') },
      ]);
      mockPrisma.jobView.count.mockResolvedValue(3);

      const result = await service.getJobViewsAnalyticsForJob(
        42,
        start,
        end,
        'day'
      );

      expect(mockPrisma.jobView.findMany).toHaveBeenCalledWith({
        where: { jobId: 42, viewedAt: { gte: start, lte: end } },
        select: { jobId: true, viewedAt: true },
      });
      expect(mockPrisma.jobView.count).toHaveBeenCalledWith({
        where: { jobId: 42 },
      });
      expect(result.totalViews).toBe(3);
      expect(result.series).toEqual([
        { period: '2026-06-02', viewCount: 2 },
        { period: '2026-06-05', viewCount: 1 },
      ]);
    });

    it('totalViews includes views outside the [start, end] range', async () => {
      mockPrisma.jobView.findMany.mockResolvedValue([
        { jobId: 7, viewedAt: new Date('2026-06-02T10:00:00.000') },
      ]);
      mockPrisma.jobView.count.mockResolvedValue(17);

      const result = await service.getJobViewsAnalyticsForJob(
        7,
        start,
        end,
        'day'
      );

      expect(result.totalViews).toBe(17);
      expect(result.series).toEqual([{ period: '2026-06-02', viewCount: 1 }]);
    });

    it('returns empty result with zero counts for a job with no views', async () => {
      mockPrisma.jobView.findMany.mockResolvedValue([]);
      mockPrisma.jobView.count.mockResolvedValue(0);

      const result = await service.getJobViewsAnalyticsForJob(
        99,
        start,
        end,
        'day'
      );

      expect(result.totalViews).toBe(0);
      expect(result.series).toEqual([]);
    });

    it('returns empty result for an unknown jobId', async () => {
      mockPrisma.jobView.findMany.mockResolvedValue([]);
      mockPrisma.jobView.count.mockResolvedValue(0);

      const result = await service.getJobViewsAnalyticsForJob(
        999999,
        start,
        end,
        'day'
      );

      expect(result.totalViews).toBe(0);
      expect(result.series).toEqual([]);
    });

    it('buckets by month when groupBy is month', async () => {
      mockPrisma.jobView.findMany.mockResolvedValue([
        { jobId: 1, viewedAt: new Date('2026-01-15T10:00:00.000') },
        { jobId: 1, viewedAt: new Date('2026-01-20T10:00:00.000') },
        { jobId: 1, viewedAt: new Date('2026-03-05T10:00:00.000') },
      ]);
      mockPrisma.jobView.count.mockResolvedValue(3);

      const result = await service.getJobViewsAnalyticsForJob(
        1,
        start,
        end,
        'month'
      );

      expect(result.series).toEqual([
        { period: '2026-01', viewCount: 2 },
        { period: '2026-03', viewCount: 1 },
      ]);
    });
  });

  describe('GetJobsQueryDTO currency validation', () => {
    it('accepts a valid currency code', async () => {
      const dto = plainToInstance(GetJobsQueryDTO, { currency: 'VND' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('rejects an unknown currency code', async () => {
      const dto = plainToInstance(GetJobsQueryDTO, { currency: 'BTC' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('accepts undefined currency (optional field)', async () => {
      const dto = plainToInstance(GetJobsQueryDTO, {});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
