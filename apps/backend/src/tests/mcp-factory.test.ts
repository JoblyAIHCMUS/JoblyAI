import { describe, it, expect, vi, beforeEach } from 'vitest';

const registerSpy = vi.fn();

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  const McpServerCtor = vi.fn(function () {
    return { registerTool: registerSpy } as never;
  });
  return { McpServer: McpServerCtor };
});

import { createMcpServer } from '../app/mcp/server/mcp.factory';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (role: 'employer' | 'candidate'): McpState => ({
  userId: 'user-123',
  role,
  companyId: role === 'employer' ? 42 : null,
  prisma: {} as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  gcsService: {} as never,
  resumeParserService: {} as never,
  profileSyncService: {} as never,
});

describe('createMcpServer', () => {
  beforeEach(() => {
    registerSpy.mockClear();
  });

  it('registers whoami and 10 candidate tools for candidate role', () => {
    createMcpServer(buildState('candidate'));

    const names = registerSpy.mock.calls.map((c) => c[0]);
    expect(names.sort()).toEqual(
      [
        'whoami',
        'get_my_profile',
        'list_my_resumes',
        'search_jobs',
        'list_my_applications',
        'generate_upload_url',
        'create_resume_record',
        'extract_resume_text',
        'score_resume',
        'sync_resume_to_profile',
        'save_resume_score',
      ].sort()
    );
  });

  it('registers whoami and 10 employer tools for employer role', () => {
    createMcpServer(buildState('employer'));

    const names = registerSpy.mock.calls.map((c) => c[0]);
    expect(names.sort()).toEqual(
      [
        'whoami',
        'get_my_company',
        'list_categories',
        'list_skills',
        'list_jobs',
        'get_job',
        'list_applicants',
        'get_pre_shortlist_questions',
        'add_pre_shortlist_questions',
        'update_pre_shortlist_question',
        'remove_pre_shortlist_questions',
      ].sort()
    );
  });
});
