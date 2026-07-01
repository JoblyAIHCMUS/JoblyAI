import { describe, it, expect, vi } from 'vitest';
import { withdrawApplicationHandler } from '../app/mcp/tools/candidate/withdraw-application.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  findUnique: ReturnType<typeof vi.fn>,
  update: ReturnType<typeof vi.fn>
): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    application: { findUnique, update },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: {
    calculateExplanation: vi.fn().mockResolvedValue(undefined),
  } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: {
    createNotifications: vi.fn().mockResolvedValue([]),
  } as never,
});

describe('withdrawApplicationHandler', () => {
  it('withdraws application when status is APPLIED', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 1,
      candidateId: 'user-123',
      status: 'APPLIED',
    });
    const update = vi.fn().mockResolvedValue({
      id: 1,
      status: 'WITHDRAWN',
      job: { id: 1 },
      resume: { id: 1 },
    });
    const state = buildState(findUnique, update);

    const result = await withdrawApplicationHandler(state, {
      applicationId: 1,
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'WITHDRAWN' },
      include: {
        job: {
          include: {
            category: true,
            company: true,
            postedBy: { select: { id: true, name: true, email: true } },
          },
        },
        resume: {
          select: { id: true, fileKey: true, aiScore: true, isDefault: true },
        },
      },
    });
    expect(result.structuredContent?.status).toBe('WITHDRAWN');
  });

  it('rejects withdrawal when status is not APPLIED', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 1,
      candidateId: 'user-123',
      status: 'INTERVIEW',
    });
    const update = vi.fn();
    const state = buildState(findUnique, update);

    const result = await withdrawApplicationHandler(state, {
      applicationId: 1,
    });

    expect(update).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      'Only applications with APPLIED status can be withdrawn'
    );
  });

  it('returns "Application not found" for cross-user access', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 1,
      candidateId: 'other-user',
      status: 'APPLIED',
    });
    const update = vi.fn();
    const state = buildState(findUnique, update);

    const result = await withdrawApplicationHandler(state, {
      applicationId: 1,
    });

    expect(update).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Application not found');
  });
});
