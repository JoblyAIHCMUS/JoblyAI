import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EmployerService } from '../app/employer/employer.service';
import { S3Service } from '../app/s3/s3.service';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
  },
  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
  employer: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const mockS3Service = vi.hoisted(() => ({
  deleteFile: vi.fn(),
}));

describe('EmployerService', () => {
  let service: EmployerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployerService,
        {
          provide: 'PRISMA_CLIENT',
          useValue: mockPrisma,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<EmployerService>(EmployerService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchEmployers', () => {
    it('should throw BadRequestException when both name and email are empty', async () => {
      await expect(
        service.searchEmployers({
          requesterId: 'requester-1',
          name: '   ',
          email: '',
        })
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should search by name with offset and limit pagination', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([
        {
          id: 'u-1',
          firstName: 'Jane',
          lastName: 'Doe',
          name: 'Jane Doe',
          email: 'jane@company.com',
          avatarUrl: null,
        },
      ]);

      const result = await service.searchEmployers({
        requesterId: 'requester-1',
        name: 'Jane Doe',
        offset: 10,
        limit: 5,
      });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'requester-1' },
            role: 'employer',
            banned: { not: true },
            OR: expect.arrayContaining([
              {
                firstName: {
                  contains: 'Jane Doe',
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: 'Jane Doe',
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  contains: 'Jane Doe',
                  mode: 'insensitive',
                },
              },
              {
                firstName: {
                  contains: 'Jane',
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: 'Doe',
                  mode: 'insensitive',
                },
              },
            ]),
          }),
          skip: 10,
          take: 5,
        })
      );

      expect(result).toEqual([
        {
          id: 'u-1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@company.com',
          avatarUrl: undefined,
        },
      ]);
    });

    it('should search by email only', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);

      await service.searchEmployers({
        requesterId: 'requester-1',
        email: 'company.com',
      });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              {
                email: {
                  contains: 'company.com',
                  mode: 'insensitive',
                },
              },
            ],
          }),
          skip: 0,
          take: 5,
        })
      );
    });

    it('should include both name and email filters when both are provided', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);

      await service.searchEmployers({
        requesterId: 'requester-1',
        name: 'Jane',
        email: 'jane@company.com',
      });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              {
                email: {
                  contains: 'jane@company.com',
                  mode: 'insensitive',
                },
              },
              {
                firstName: {
                  contains: 'Jane',
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: 'Jane',
                  mode: 'insensitive',
                },
              },
            ]),
          }),
        })
      );
    });

    it('should map firstName and lastName from name when missing in database', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([
        {
          id: 'u-2',
          firstName: null,
          lastName: null,
          name: 'Alex Johnson',
          email: 'alex@company.com',
          avatarUrl: 'https://example.com/a.png',
        },
      ]);

      const result = await service.searchEmployers({
        requesterId: 'requester-1',
        name: 'Alex',
      });

      expect(result).toEqual([
        {
          id: 'u-2',
          firstName: 'Alex',
          lastName: 'Johnson',
          email: 'alex@company.com',
          avatarUrl: 'https://example.com/a.png',
        },
      ]);
    });
  });
});
