import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { UserService } from '../app/user/user.service';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

const CURRENT_USER = {
  id: 'user-1',
  email: 'a@b.com',
  firstName: 'Old',
  lastName: 'Name',
  phoneNumber: null,
  dateOfBirth: null,
  gender: null,
  avatarUrl: null,
  emailVerified: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('UserService.updateUserProfile — name sync', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'PRISMA_CLIENT', useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    vi.clearAllMocks();

    mockPrisma.user.findUnique.mockResolvedValue(CURRENT_USER);
    mockPrisma.user.update.mockResolvedValue(CURRENT_USER);
  });

  it('updates name when both firstName and lastName are patched', async () => {
    await service.updateUserProfile('user-1', {
      firstName: 'New',
      lastName: 'Name',
    });

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

  it('updates name to "<new first> <existing last>" when only firstName is patched', async () => {
    await service.updateUserProfile('user-1', { firstName: 'New' });

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: 'New',
          name: 'New Name',
        }),
      })
    );
  });

  it('updates name to "<existing first> <new last>" when only lastName is patched', async () => {
    await service.updateUserProfile('user-1', { lastName: 'Smith' });

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lastName: 'Smith',
          name: 'Old Smith',
        }),
      })
    );
  });

  it('leaves name unchanged when neither firstName nor lastName is patched', async () => {
    await service.updateUserProfile('user-1', { phoneNumber: '+1 555 0000' });

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ name: expect.anything() }),
      })
    );
  });

  it('preserves existing User.name when both firstName and lastName are cleared to empty strings', async () => {
    // OAuth-like user: firstName/lastName are null, but name is populated.
    // If a client passes empty strings, we should NOT clobber the existing
    // name with null — fall back to user.name to avoid data loss.
    const oauthLikeUser = {
      ...CURRENT_USER,
      firstName: null,
      lastName: null,
      name: 'Google Display Name',
    };
    mockPrisma.user.findUnique.mockResolvedValueOnce(oauthLikeUser);
    mockPrisma.user.update.mockResolvedValueOnce(oauthLikeUser);

    await service.updateUserProfile('user-1', { firstName: '', lastName: '' });

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: '',
          lastName: '',
          name: 'Google Display Name',
        }),
      })
    );
  });

  it('throws NotFoundException when user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.updateUserProfile('missing', { firstName: 'X' })
    ).rejects.toThrow(NotFoundException);
  });
});
