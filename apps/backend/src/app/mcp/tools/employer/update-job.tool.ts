import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import { UpdateJobInputSchema } from './employer.types';

export async function updateJobHandler(state: McpState, rawInput: unknown) {
  try {
    const input = UpdateJobInputSchema.parse(rawInput);
    const { id, requirements, ...jobData } = input;

    const job = await state.prisma.jobPosting.findFirst({
      where: { id, deletedAt: null },
    });

    if (!job) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Job not found' }],
      };
    }

    if (job.postedById !== state.userId) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Forbidden: only the job poster can edit this job',
          },
        ],
      };
    }

    const updated = await state.prisma.jobPosting.update({
      where: { id },
      data: {
        ...jobData,
        requirements: requirements
          ? {
              deleteMany: {},
              create: requirements.map((r) => ({
                skillId: r.skillId,
                importance: r.importance,
                minYearsExperience: r.minYearsExperience,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        company: true,
        requirements: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });

    await state.prisma.application.updateMany({
      where: { jobId: id },
      data: { matchPercentage: null },
    });

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(updated, null, 2) },
      ],
      structuredContent: { ...updated },
    };
  } catch (error) {
    state.logger.error(error, 'update_job tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerUpdateJobTool(
  server: McpServer,
  state: McpState,
): void {
  server.registerTool(
    'update_job',
    {
      description:
        'Update a job posting (full PATCH). Caller must be the original poster. companyId cannot be reassigned.',
      inputSchema: UpdateJobInputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => updateJobHandler(state, args),
  );
}
