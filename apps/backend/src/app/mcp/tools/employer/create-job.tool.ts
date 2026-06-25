import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import { CreateJobInputSchema } from './employer.types';

export async function createJobHandler(state: McpState, rawInput: unknown) {
  try {
    const input = CreateJobInputSchema.parse(rawInput);
    const { requirements, ...jobData } = input;

    if (state.companyId === null) {
      return {
        isError: true,
        content: [
          { type: 'text' as const, text: 'Forbidden: no employer profile' },
        ],
      };
    }

    const created = await state.prisma.jobPosting.create({
      data: {
        ...jobData,
        postedById: state.userId,
        companyId: state.companyId,
        requirements:
          requirements && requirements.length > 0
            ? {
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

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(created, null, 2) },
      ],
      structuredContent: { ...created },
    };
  } catch (error) {
    state.logger.error(error, 'create_job tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerCreateJobTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'create_job',
    {
      description:
        "Create a job posting. companyId is auto-resolved from the caller's Employer record. requirements take skillId from list_skills.",
      inputSchema: CreateJobInputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => createJobHandler(state, args)
  );
}
