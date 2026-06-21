import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EmployerService } from '../app/employer/employer.service';
import { GcsService } from '../app/gcs/gcs.service';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
  employer: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const mockGcsService = vi.hoisted(() => ({
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
          provide: GcsService,
          useValue: mockGcsService,
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

  describe('getProfileDetails', () => {
    const baseUser = {
      id: 'user-1',
      firstName: 'Jane',
      lastName: 'Admin',
      email: 'jane@company.com',
      emailVerified: true,
      banned: false,
      banExpires: null,
      banReason: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    beforeEach(() => {
      mockPrisma.$queryRaw.mockResolvedValue([]);
    });

    it('should mark the profile as company admin when membership matches company adminId', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        ...baseUser,
        employer: {
          id: 10,
          company: {
            id: 1,
            name: 'Acme',
            adminId: 10,
          },
        },
      });

      const result = await service.getProfileDetails('user-1');

      expect(result.isCompanyAdmin).toBe(true);
    });

    it('should mark the profile as non-admin when membership does not match company adminId', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        ...baseUser,
        employer: {
          id: 11,
          company: {
            id: 1,
            name: 'Acme',
            adminId: 10,
          },
        },
      });

      const result = await service.getProfileDetails('user-1');

      expect(result.isCompanyAdmin).toBe(false);
    });

    it('should mark the profile as non-admin when no employer company exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        ...baseUser,
        employer: null,
      });

      const result = await service.getProfileDetails('user-1');

      expect(result.company).toBeNull();
      expect(result.isCompanyAdmin).toBe(false);
    });
  });
});
