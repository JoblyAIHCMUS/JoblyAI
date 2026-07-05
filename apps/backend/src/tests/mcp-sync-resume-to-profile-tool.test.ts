import { describe, it, expect, vi } from 'vitest';
import { syncResumeToProfileHandler } from '../app/mcp/tools/candidate/sync-resume-to-profile.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (opts: {
  resume: { findUnique: ReturnType<typeof vi.fn> } | null;
  commitMerge: ReturnType<typeof vi.fn>;
}): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: { resume: opts.resume } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: { commitMerge: opts.commitMerge } as never,
});

const sampleData = {
  title: 'Senior Engineer',
  bio: 'Five years of experience.',
  skills: [],
  education: [],
  experience: [],
  contacts: [],
  socials: [],
  certificates: [],
};

describe('syncResumeToProfileHandler', () => {
  it('calls ProfileSyncService.commitMerge with (userId, resumeId, data)', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'user-123',
    });
    const commitMerge = vi.fn().mockResolvedValue({ success: true });
    const state = buildState({ resume: { findUnique }, commitMerge });

    const result = await syncResumeToProfileHandler(state, {
      resumeId: 42,
      data: sampleData,
    });

    expect(commitMerge).toHaveBeenCalledWith('user-123', 42, sampleData);
    expect(result.structuredContent).toEqual({ success: true });
  });

  it('returns isError when resume not found', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const state = buildState({
      resume: { findUnique },
      commitMerge: vi.fn(),
    });

    const result = await syncResumeToProfileHandler(state, {
      resumeId: 999,
      data: sampleData,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Resume not found');
  });

  it('returns isError when access denied', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'other-user',
    });
    const state = buildState({
      resume: { findUnique },
      commitMerge: vi.fn(),
    });

    const result = await syncResumeToProfileHandler(state, {
      resumeId: 42,
      data: sampleData,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Access denied');
  });

  it('returns isError when commitMerge throws', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 42,
      candidateId: 'user-123',
    });
    const commitMerge = vi.fn().mockRejectedValue(new Error('Sync failed'));
    const state = buildState({ resume: { findUnique }, commitMerge });

    const result = await syncResumeToProfileHandler(state, {
      resumeId: 42,
      data: sampleData,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
