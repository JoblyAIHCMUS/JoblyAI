import { describe, it, expect, vi } from 'vitest';
import { getMyCompanyHandler } from '../app/mcp/tools/employer/get-my-company.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  employer: {
    companyId: number;
    company: { name: string; slug: string };
  } | null
): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId: employer?.companyId ?? null,
  prisma: {
    employer: { findUnique: vi.fn().mockResolvedValue(employer) },
  } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
});

describe('getMyCompanyHandler', () => {
  it('returns companyId, name, slug when Employer record exists', async () => {
    const state = buildState({
      companyId: 42,
      company: { name: 'Acme', slug: 'acme' },
    });

    const result = await getMyCompanyHandler(state);

    expect(result.structuredContent).toEqual({
      companyId: 42,
      name: 'Acme',
      slug: 'acme',
    });
    expect(result.isError).toBeUndefined();
  });

  it('returns all-null when caller has no Employer record', async () => {
    const state = buildState(null);

    const result = await getMyCompanyHandler(state);

    expect(result.structuredContent).toEqual({
      companyId: null,
      name: null,
      slug: null,
    });
  });

  it('returns isError and logs when Prisma throws', async () => {
    const state: McpState = {
      userId: 'user-123',
      role: 'employer',
      companyId: null,
      prisma: {
        employer: {
          findUnique: vi.fn().mockRejectedValue(new Error('DB error')),
        },
      } as never,
      logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
    };

    const result = await getMyCompanyHandler(state);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
    expect(state.logger.error).toHaveBeenCalled();
  });
});
