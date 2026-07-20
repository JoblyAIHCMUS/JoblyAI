import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CompanyService } from '../app/company/company.service';
import { GcsService } from '../app/gcs/gcs.service';
import { GetCompaniesQueryDTO } from '../app/company/dto/company.dto';

const mockPrisma = vi.hoisted(() => ({
  company: {
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  employer: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const mockGcsService = vi.hoisted(() => ({
  deleteFile: vi.fn(),
}));

describe('CompanyService - getPaginatedCompanies', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
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

    service = module.get<CompanyService>(CompanyService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated companies list with default query', async () => {
    const mockCompanies = [
      {
        id: 1,
        name: 'Google',
        slug: 'google',
        websiteUrl: 'https://google.com',
        sizeRange: '10000+',
        industry: 'Technology',
        description: 'Search engine company',
        location: {
          id: 'loc-california',
          provider: 'manual',
          providerId: 'California',
          formattedAddress: 'California',
          lat: 0,
          lng: 0,
          city: null,
          state: null,
          country: null,
          postcode: null,
        },
        logoUrl: 'https://logo.com/google.png',
        locations: [
          {
            id: 'loc-california',
            provider: 'manual',
            providerId: 'California',
            formattedAddress: 'California',
            lat: 0,
            lng: 0,
            city: null,
            state: null,
            country: null,
            postcode: null,
          },
          {
            id: 'loc-new-york',
            provider: 'manual',
            providerId: 'New York',
            formattedAddress: 'New York',
            lat: 0,
            lng: 0,
            city: null,
            state: null,
            country: null,
            postcode: null,
          },
        ],
        _count: {
          jobPostings: 5,
        },
      },
    ];

    mockPrisma.$transaction.mockResolvedValueOnce([1, mockCompanies]);

    const query: GetCompaniesQueryDTO = {
      page: 1,
      pageSize: 10,
    };

    const result = await service.getPaginatedCompanies(query);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.company.count).toHaveBeenCalledWith({
      where: {},
    });
    expect(mockPrisma.company.findMany).toHaveBeenCalledWith({
      where: {},
      include: {
        location: true,
        locations: true,
        _count: {
          select: {
            jobPostings: {
              where: { status: 'OPEN', deletedAt: null },
            },
          },
        },
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    expect(result).toEqual({
      companies: [
        {
          id: 1,
          name: 'Google',
          slug: 'google',
          websiteUrl: 'https://google.com',
          sizeRange: '10000+',
          industry: 'Technology',
          description: 'Search engine company',
          location: 'California',
          logoUrl: 'https://logo.com/google.png',
          locations: ['California', 'New York'],
          logo: {
            imageUrl: 'https://logo.com/google.png',
            alt: 'Google logo',
            rounded: 'square',
          },
          jobs: 5,
          tag: {
            id: '1',
            label: 'Technology',
            tone: 'orange-outline',
          },
          locationDetail: {
            id: 'loc-california',
            provider: 'manual',
            providerId: 'California',
            formattedAddress: 'California',
            lat: 0,
            lng: 0,
            city: null,
            state: null,
            country: null,
            postcode: null,
          },
          locationDetails: [
            {
              id: 'loc-california',
              provider: 'manual',
              providerId: 'California',
              formattedAddress: 'California',
              lat: 0,
              lng: 0,
              city: null,
              state: null,
              country: null,
              postcode: null,
            },
            {
              id: 'loc-new-york',
              provider: 'manual',
              providerId: 'New York',
              formattedAddress: 'New York',
              lat: 0,
              lng: 0,
              city: null,
              state: null,
              country: null,
              postcode: null,
            },
          ],
          _count: {
            jobPostings: 5,
          },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  });

  it('should filter by keyword search (q)', async () => {
    mockPrisma.$transaction.mockResolvedValueOnce([0, []]);

    const query: GetCompaniesQueryDTO = {
      q: 'Google Tech',
    };

    await service.getPaginatedCompanies(query);

    expect(mockPrisma.company.count).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: 'Google', mode: 'insensitive' } },
              { description: { contains: 'Google', mode: 'insensitive' } },
              { industry: { contains: 'Google', mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { name: { contains: 'Tech', mode: 'insensitive' } },
              { description: { contains: 'Tech', mode: 'insensitive' } },
              { industry: { contains: 'Tech', mode: 'insensitive' } },
            ],
          },
        ],
      },
    });
  });

  it('should filter by location, industry, and sizeRange', async () => {
    mockPrisma.$transaction.mockResolvedValueOnce([0, []]);

    const query: GetCompaniesQueryDTO = {
      location: 'California',
      industry: ['Technology', 'Fintech'],
      sizeRange: ['10000+'],
    };

    await service.getPaginatedCompanies(query);

    expect(mockPrisma.company.count).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            OR: [
              {
                location: {
                  formattedAddress: {
                    contains: 'California',
                    mode: 'insensitive',
                  },
                },
              },
              {
                locations: {
                  some: {
                    formattedAddress: {
                      contains: 'California',
                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          },
          {
            industry: { in: ['Technology', 'Fintech'] },
          },
          {
            sizeRange: { in: ['10000+'] },
          },
        ],
      },
    });
  });
});

describe('CompanyService - member management authorization', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
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

    service = module.get<CompanyService>(CompanyService);
    vi.clearAllMocks();
  });

  // getEmployees is used as the public entry point that runs
  // assertRequesterIsCompanyAdminEmployer before listing members.

  it('allows the company owner (adminId match) to list employees', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce({
      id: 10,
      role: 'employee', // legacy string: ownership alone must suffice
    });
    mockPrisma.employer.findMany.mockResolvedValueOnce([]);

    const result = await service.getEmployees(1, 'user-owner');

    expect(result).toEqual([]);
  });

  it('allows a member with role admin to list employees (multi-admin)', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce({
      id: 11, // not the owner
      role: 'admin',
    });
    mockPrisma.employer.findMany.mockResolvedValueOnce([]);

    const result = await service.getEmployees(1, 'user-promoted-admin');

    expect(result).toEqual([]);
  });

  it('rejects a plain employee member', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce({
      id: 12,
      role: 'employee',
    });

    await expect(service.getEmployees(1, 'user-employee')).rejects.toThrow(
      ForbiddenException
    );
  });

  it('rejects a requester with no membership in the company', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce(null);

    await expect(service.getEmployees(1, 'user-outsider')).rejects.toThrow(
      ForbiddenException
    );
  });

  it('throws NotFoundException for a missing company', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce(null);

    await expect(service.getEmployees(999, 'user-owner')).rejects.toThrow(
      NotFoundException
    );
  });
});

describe('CompanyService - updateEmployeeRole', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
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

    service = module.get<CompanyService>(CompanyService);
    vi.clearAllMocks();
  });

  const mockOwnerRequester = () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce({
      id: 10,
      role: 'admin',
    });
  };

  it('promotes an employee to admin', async () => {
    mockOwnerRequester();
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-2',
      email: 'james@example.com',
    });
    mockPrisma.employer.findUnique.mockResolvedValueOnce({
      id: 11,
      companyId: 1,
    });
    mockPrisma.employer.update.mockResolvedValueOnce({
      id: 11,
      companyId: 1,
      employerId: 'user-2',
      role: 'admin',
    });

    const result = await service.updateEmployeeRole(
      1,
      'user-owner',
      'james@example.com',
      'admin'
    );

    expect(mockPrisma.employer.update).toHaveBeenCalledWith({
      where: { employerId: 'user-2' },
      data: { role: 'admin' },
    });
    expect(result.role).toBe('admin');
  });

  it('demotes a non-owner admin to employee', async () => {
    mockOwnerRequester();
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-2',
      email: 'james@example.com',
    });
    mockPrisma.employer.findUnique.mockResolvedValueOnce({
      id: 11, // not the owner (adminId = 10)
      companyId: 1,
    });
    mockPrisma.employer.update.mockResolvedValueOnce({
      id: 11,
      companyId: 1,
      employerId: 'user-2',
      role: 'employee',
    });

    await service.updateEmployeeRole(
      1,
      'user-owner',
      'james@example.com',
      'employee'
    );

    expect(mockPrisma.employer.update).toHaveBeenCalledWith({
      where: { employerId: 'user-2' },
      data: { role: 'employee' },
    });
  });

  it('rejects demoting the company owner', async () => {
    mockOwnerRequester();
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-owner',
      email: 'owner@example.com',
    });
    mockPrisma.employer.findUnique.mockResolvedValueOnce({
      id: 10, // matches company.adminId
      companyId: 1,
    });

    await expect(
      service.updateEmployeeRole(
        1,
        'user-owner',
        'owner@example.com',
        'employee'
      )
    ).rejects.toThrow(BadRequestException);

    expect(mockPrisma.employer.update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException for an unknown user email', async () => {
    mockOwnerRequester();
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.updateEmployeeRole(1, 'user-owner', 'ghost@example.com', 'admin')
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when the target is not a member of this company', async () => {
    mockOwnerRequester();
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-3',
      email: 'outsider@example.com',
    });
    mockPrisma.employer.findUnique.mockResolvedValueOnce({
      id: 13,
      companyId: 2, // different company
    });

    await expect(
      service.updateEmployeeRole(
        1,
        'user-owner',
        'outsider@example.com',
        'admin'
      )
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects when the requester is not a company admin', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce({
      id: 12,
      role: 'employee',
    });

    await expect(
      service.updateEmployeeRole(
        1,
        'user-employee',
        'james@example.com',
        'admin'
      )
    ).rejects.toThrow(ForbiddenException);
  });
});

describe('CompanyService - removeEmployee', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
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

    service = module.get<CompanyService>(CompanyService);
    vi.clearAllMocks();
  });

  it('removes a member by unlinking them from the company', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce({
      id: 10,
      role: 'admin',
    });
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-2',
      email: 'james@example.com',
    });
    mockPrisma.employer.findUnique.mockResolvedValueOnce({
      id: 11,
      companyId: 1,
    });
    mockPrisma.employer.update.mockResolvedValueOnce({
      id: 11,
      companyId: null,
    });

    await service.removeEmployee(1, 'user-owner', 'james@example.com');

    expect(mockPrisma.employer.update).toHaveBeenCalledWith({
      where: { employerId: 'user-2' },
      data: { companyId: null },
    });
  });

  it('lets a promoted (non-owner) admin remove a member', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce({
      id: 11, // not owner, but role admin
      role: 'admin',
    });
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-3',
      email: 'sarah@example.com',
    });
    mockPrisma.employer.findUnique.mockResolvedValueOnce({
      id: 12,
      companyId: 1,
    });
    mockPrisma.employer.update.mockResolvedValueOnce({
      id: 12,
      companyId: null,
    });

    await service.removeEmployee(1, 'user-promoted-admin', 'sarah@example.com');

    expect(mockPrisma.employer.update).toHaveBeenCalledWith({
      where: { employerId: 'user-3' },
      data: { companyId: null },
    });
  });

  it('rejects removing the company owner', async () => {
    mockPrisma.company.findUnique.mockResolvedValueOnce({
      id: 1,
      adminId: 10,
    });
    mockPrisma.employer.findFirst.mockResolvedValueOnce({
      id: 10,
      role: 'admin',
    });
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-owner',
      email: 'owner@example.com',
    });
    mockPrisma.employer.findUnique.mockResolvedValueOnce({
      id: 10, // matches company.adminId
      companyId: 1,
    });

    await expect(
      service.removeEmployee(1, 'user-owner', 'owner@example.com')
    ).rejects.toThrow(BadRequestException);

    expect(mockPrisma.employer.update).not.toHaveBeenCalled();
  });
});
