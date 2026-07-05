import { describe, it, expect, vi } from 'vitest';
import { scoreResumeHandler } from '../app/mcp/tools/candidate/score-resume.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (opts: {
  resume: { findUnique: ReturnType<typeof vi.fn> } | null;
  getFileBuffer: ReturnType<typeof vi.fn>;
  extractTextFromPdf: ReturnType<typeof vi.fn>;
}): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: { resume: opts.resume } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: { getFileBuffer: opts.getFileBuffer } as never,
  resumeParserService: {
    extractTextFromPdf: opts.extractTextFromPdf,
  } as never,
  profileSyncService: {} as never,
});

describe('scoreResumeHandler', () => {
  it('returns text + pageCount when ownership and download succeed', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'user-123',
      fileKey: 'resumes/abc.pdf',
    });
    const getFileBuffer = vi.fn().mockResolvedValue(Buffer.from('PDF'));
    const extractTextFromPdf = vi.fn().mockResolvedValue({
      text: 'Experienced software engineer with a decade of building scalable distributed systems.',
      pageCount: 2,
    });
    const state = buildState({
      resume: { findUnique },
      getFileBuffer,
      extractTextFromPdf,
    });

    const result = await scoreResumeHandler(state, { resumeId: 42 });

    expect(result.structuredContent).toEqual({
      text: 'Experienced software engineer with a decade of building scalable distributed systems.',
      pageCount: 2,
      isEmpty: false,
    });
  });

  it('returns isError when resume not found', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const state = buildState({
      resume: { findUnique },
      getFileBuffer: vi.fn(),
      extractTextFromPdf: vi.fn(),
    });

    const result = await scoreResumeHandler(state, { resumeId: 999 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Resume not found');
  });

  it('returns isError when resume has no fileKey', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'user-123',
      fileKey: null,
    });
    const state = buildState({
      resume: { findUnique },
      getFileBuffer: vi.fn(),
      extractTextFromPdf: vi.fn(),
    });

    const result = await scoreResumeHandler(state, { resumeId: 42 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Resume has no fileKey');
  });

  it('returns isError when access denied', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'other-user',
      fileKey: 'resumes/abc.pdf',
    });
    const state = buildState({
      resume: { findUnique },
      getFileBuffer: vi.fn(),
      extractTextFromPdf: vi.fn(),
    });

    const result = await scoreResumeHandler(state, { resumeId: 42 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Access denied');
  });
});
