import { describe, it, expect, vi } from 'vitest';
import { createResumeRecordHandler } from '../app/mcp/tools/candidate/create-resume-record.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  create: ReturnType<typeof vi.fn>
): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {
    resume: { create },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('createResumeRecordHandler', () => {
  it('creates resume record with candidateId from state.userId', async () => {
    const create = vi.fn().mockResolvedValue({ id: 42 });
    const state = buildState(create);

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
