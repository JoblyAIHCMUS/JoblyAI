import { describe, it, expect, vi } from 'vitest';
import { createJobHandler } from '../app/mcp/tools/employer/create-job.tool';
import type { McpState } from '../app/mcp/server/mcp.types';

const buildState = (
  create: ReturnType<typeof vi.fn>,
  companyId: number | null = 42
): McpState => ({
  userId: 'user-123',
  role: 'employer',
  companyId,
  prisma: { jobPosting: { create } } as never,
  logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  matchExplanationService: {
    calculateExplanation: vi.fn().mockResolvedValue(undefined),
  } as never,
  eventEmitter: { emit: vi.fn() } as never,
  notificationsService: {
    createNotifications: vi.fn().mockResolvedValue([]),
  } as never,
});

const validInput = {
  title: 'Senior Backend',
  description: 'Build APIs',
  categoryId: 1,
  requirements: [{ skillId: 5, importance: 'REQUIRED' as const }],
  location: 'Remote',
};

describe('createJobHandler', () => {
  it('creates the job with auto-injected companyId and postedById', async () => {
    const create = vi.fn().mockResolvedValue({
      id: 7,
      title: 'Senior Backend',
      description: 'Build APIs',
      companyId: 42,
      postedById: 'user-123',
      category: {},
      company: {},
      requirements: [],
      _count: { applications: 0 },
    });
    const state = buildState(create);

    const result = await createJobHandler(state, validInput);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Senior Backend',
          companyId: 42,
          postedById: 'user-123',
          requirements: {
            create: [
              {
                skillId: 5,
                importance: 'REQUIRED',
                minYearsExperience: undefined,
              },
            ],
          },
        }),
      })
    );
    expect(result.structuredContent).toMatchObject({ id: 7 });
    expect(result.isError).toBeUndefined();
  });

  it('returns isError "no_company" when state.companyId is null', async () => {
    const create = vi.fn();
    const state = buildState(create, null);

    const result = await createJobHandler(state, validInput);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Forbidden: no employer profile');
    expect(create).not.toHaveBeenCalled();
  });

  it('returns isError when Prisma throws', async () => {
    const create = vi.fn().mockRejectedValue(new Error('DB error'));
    const state = buildState(create);

    const result = await createJobHandler(state, validInput);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Internal error');
    expect(state.logger.error).toHaveBeenCalled();
  });
});
