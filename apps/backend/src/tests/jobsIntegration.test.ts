import { vi, describe, it, expect, beforeEach } from 'vitest';
import { JobsController } from '../app/jobs/jobs.controller';
import { JobsService } from '../app/jobs/jobs.service';

const mockJobDbRecord = {
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
};

const mockPrisma = {
  jobPosting: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockEventEmitter = {
  emit: vi.fn(),
};

const mockPreShortlistService = {
  validateQuestions: vi.fn(),
};

describe('Jobs Integration (Controller + Service)', () => {
  let controller: JobsController;
  let service: JobsService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Manually instantiate to bypass dependency injection decorator metadata limitations in the test environment
    service = new JobsService(
      mockPrisma as any,
      mockEventEmitter as any,
      mockPreShortlistService as any
    );

    controller = new JobsController(service, mockEventEmitter as any);
  });

  it('should instantiate components successfully', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('GET /jobs search by company', () => {
    it('should forward search term "q" to filter by company name in Prisma query', async () => {
      // Arrange
      const queryDto = {
        q: 'Tech Corp',
        page: 1,
        pageSize: 10,
      };

      // Mock database response from Prisma transaction [count, records]
      mockPrisma.$transaction.mockResolvedValue([1, [mockJobDbRecord]]);

      // Act
      const result = await controller.getJobs(queryDto);

      // Assert
      // Verify count was called with correct search criteria including company name
      expect(mockPrisma.jobPosting.count).toHaveBeenCalled();
      const countArgs = mockPrisma.jobPosting.count.mock.calls[0][0];

      expect(countArgs.where).toEqual(
        expect.objectContaining({
          AND: expect.arrayContaining([
            {
              OR: [
                { title: { contains: 'Tech', mode: 'insensitive' } },
                { description: { contains: 'Tech', mode: 'insensitive' } },
                {
                  company: {
                    name: { contains: 'Tech', mode: 'insensitive' },
                  },
                },
              ],
            },
            {
              OR: [
                { title: { contains: 'Corp', mode: 'insensitive' } },
                { description: { contains: 'Corp', mode: 'insensitive' } },
                {
                  company: {
                    name: { contains: 'Corp', mode: 'insensitive' },
                  },
                },
              ],
            },
          ]),
        })
      );

      // Verify final formatted response matches
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].company.name).toBe('Tech Corp');
      expect(result.total).toBe(1);
    });
  });
});
