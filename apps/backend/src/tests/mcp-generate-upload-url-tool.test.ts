import { describe, it, expect, vi } from 'vitest';
import { generateUploadUrlHandler } from '../app/mcp/tools/candidate/generate-upload-url.tool';
import type { McpState } from '../app/mcp/server/mcp.types';
import { GcsFolder } from '../app/gcs/gcs.interface';

const buildState = (generate: ReturnType<typeof vi.fn>): McpState => ({
  userId: 'user-123',
  role: 'candidate',
  companyId: null,
  prisma: {} as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: { generatePresignedUploadUrl: generate } as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('generateUploadUrlHandler', () => {
  it('calls GcsService.generatePresignedUploadUrl with RESUMES folder and returns result', async () => {
    const generate = vi.fn().mockResolvedValue({
      uploadUrl: 'https://storage.googleapis.com/...',
      fileKey: 'resumes/abc.pdf',
      fileUrl: 'https://example.com/abc.pdf',
      expiresIn: 900,
    });
    const state = buildState(generate);

    const result = await generateUploadUrlHandler(state, {
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileSize: 245678,
    });

    expect(generate).toHaveBeenCalledWith(
      'resume.pdf',
      'application/pdf',
      GcsFolder.RESUMES
    );
    expect(result.structuredContent).toEqual({
      uploadUrl: 'https://storage.googleapis.com/...',
      fileKey: 'resumes/abc.pdf',
      fileUrl: 'https://example.com/abc.pdf',
      expiresIn: 900,
    });
  });

  it('returns isError when GcsService throws', async () => {
    const generate = vi.fn().mockRejectedValue(new Error('GCS down'));
    const state = buildState(generate);

    const result = await generateUploadUrlHandler(state, {
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileSize: 100,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
  });
});
