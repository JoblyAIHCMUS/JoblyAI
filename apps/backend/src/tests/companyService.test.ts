import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CompanyService } from '../app/company/company.service';
import { GcsService } from '../app/gcs/gcs.service';
import { GetCompaniesQueryDTO } from '../app/company/dto/company.dto';

const mockPrisma = vi.hoisted(() => ({
  company: {
    count: vi.fn(),
    findMany: vi.fn(),
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
