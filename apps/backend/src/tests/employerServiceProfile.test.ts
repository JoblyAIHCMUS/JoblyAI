import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EmployerService } from '../app/employer/employer.service';
import { GcsService } from '../app/gcs/gcs.service';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  employer: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const mockGcsService = vi.hoisted(() => ({
  deleteFile: vi.fn(),
}));

const CURRENT_USER = {
  id: 'user-1',
  firstName: 'Old',
  lastName: 'Name',
  email: 'a@b.com',
  phoneNumber: null,
  avatarUrl: null,
  emailVerified: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const EXISTING_EMPLOYER = { id: 1, employerId: 'user-1' };

describe('EmployerService.updateProfile — name sync', () => {
  let service: EmployerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployerService,
        { provide: 'PRISMA_CLIENT', useValue: mockPrisma },
        { provide: GcsService, useValue: mockGcsService },
      ],
    }).compile();

    service = module.get<EmployerService>(EmployerService);
    vi.clearAllMocks();

    // Re-set the spy AFTER clearAllMocks, then set up default mock returns
    vi.spyOn(service, 'getProfileDetails' as any).mockResolvedValue({} as any);
    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrisma) => Promise<unknown>) => cb(mockPrisma)
    );
    mockPrisma.user.findUnique.mockResolvedValue(CURRENT_USER);
    mockPrisma.user.update.mockResolvedValue(CURRENT_USER);
    mockPrisma.employer.findUnique.mockResolvedValue(EXISTING_EMPLOYER);
    mockPrisma.employer.update.mockResolvedValue({ id: 1, employerId: 'user-1' });
  });

  it('updates User.name when both firstName and lastName are patched', async () => {
    await service.updateProfile('user-1', {
      firstName: 'New',
      lastName: 'Name',
    } as any);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          firstName: 'New',
          lastName: 'Name',
          name: 'New Name',
        }),
      })
    );
  });

  it('updates User.name to "<new first> <existing last>" on firstName-only patch', async () => {
    await service.updateProfile('user-1', { firstName: 'New' } as any);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: 'New',
          name: 'New Name',
        }),
      })
    );
  });

  it('updates User.name to "<existing first> <new last>" on lastName-only patch', async () => {
    await service.updateProfile('user-1', { lastName: 'Smith' } as any);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lastName: 'Smith',
          name: 'Old Smith',
        }),
      })
    );
  });

  it('preserves existing User.name when both firstName and lastName are cleared to empty strings', async () => {
    const oauthLikeUser = {
      ...CURRENT_USER,
      firstName: null,
      lastName: null,
      name: 'OAuth Display Name',
    };
    mockPrisma.user.findUnique.mockResolvedValueOnce(oauthLikeUser);
    mockPrisma.user.update.mockResolvedValueOnce(oauthLikeUser);

    await service.updateProfile('user-1', {
      firstName: '',
      lastName: '',
    } as any);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: '',
          lastName: '',
          name: 'OAuth Display Name',
        }),
      })
    );
  });
});
