import { describe, it, expect, vi } from 'vitest';
import { listMyResumesHandler } from '../app/mcp/tools/candidate/list-my-resumes.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (findMany: ReturnType<typeof vi.fn>): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    resume: { findMany },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: { calculateExplanation: vi.fn().mockResolvedValue(undefined) } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: { createNotifications: vi.fn().mockResolvedValue([]) } as never,
});

describe('listMyResumesHandler', () => {
  it('returns resumes with select and orderBy', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 1, fileName: 'resume.pdf', fileType: 'pdf', fileSize: 1000, isDefault: true, aiScore: 85, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, fileName: 'cv.docx', fileType: 'docx', fileSize: 2000, isDefault: false, aiScore: null, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const state = buildState(findMany);

    const result = await listMyResumesHandler(state);

    expect(findMany).toHaveBeenCalledWith({
      where: { candidateId: 'user-123' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        isDefault: true,
        aiScore: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    expect(result.structuredContent?.resumes).toHaveLength(2);
  });

  it('returns empty array when no resumes', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const state = buildState(findMany);

    const result = await listMyResumesHandler(state);

    expect(result.structuredContent?.resumes).toEqual([]);
  });

  it('returns isError on prisma throw', async () => {
    const findMany = vi.fn().mockRejectedValue(new Error('DB down'));
    const state = buildState(findMany);

    const result = await listMyResumesHandler(state);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
