import { describe, it, expect, vi } from 'vitest';
import { createResumeRecordHandler } from '../app/mcp/tools/candidate/create-resume-record.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  create: ReturnType<typeof vi.fn>,
  updateMany = vi.fn().mockResolvedValue({ count: 0 })
): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    $transaction: vi.fn((cb) => cb({ resume: { create, updateMany } })),
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('createResumeRecordHandler', () => {
  it('creates resume record with candidateId from state.userId', async () => {
    const create = vi.fn().mockResolvedValue({ id: 42 });
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const state = buildState(create, updateMany);

    const result = await createResumeRecordHandler(state, {
      fileKey: 'resumes/abc.pdf',
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileSize: 245678,
      isDefault: false,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        candidateId: 'user-123',
        fileKey: 'resumes/abc.pdf',
        fileName: 'resume.pdf',
        fileType: 'application/pdf',
        fileSize: 245678,
        isDefault: false,
        isSyncedToProfile: false,
      },
    });
    expect(updateMany).not.toHaveBeenCalled();
    expect(result.structuredContent).toEqual({ resumeId: 42 });
  });

  it('unsets default on other resumes when isDefault is true', async () => {
    const create = vi.fn().mockResolvedValue({ id: 42 });
    const updateMany = vi.fn().mockResolvedValue({ count: 2 });
    const state = buildState(create, updateMany);

    const result = await createResumeRecordHandler(state, {
      fileKey: 'resumes/abc.pdf',
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileSize: 245678,
      isDefault: true,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        candidateId: 'user-123',
        fileKey: 'resumes/abc.pdf',
        fileName: 'resume.pdf',
        fileType: 'application/pdf',
        fileSize: 245678,
        isDefault: true,
        isSyncedToProfile: false,
      },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        candidateId: 'user-123',
        id: { not: 42 },
      },
      data: { isDefault: false },
    });
    expect(result.structuredContent).toEqual({ resumeId: 42 });
  });

  it('returns isError when prisma throws', async () => {
    const create = vi.fn().mockRejectedValue(new Error('DB down'));
    const state = buildState(create);

    const result = await createResumeRecordHandler(state, {
      fileKey: 'resumes/abc.pdf',
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileSize: 100,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
