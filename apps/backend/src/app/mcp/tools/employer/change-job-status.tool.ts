import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import { ChangeJobStatusInputSchema } from './employer.types';

export async function changeJobStatusHandler(
  state: McpState,
  rawInput: unknown,
) {
  try {
    const { id, status } = ChangeJobStatusInputSchema.parse(rawInput);

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
            text: "Forbidden: only the job poster can change this job's status",
          },
        ],
      };
    }

    const updated = await state.prisma.jobPosting.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        company: true,
        requirements: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(updated, null, 2) },
      ],
      structuredContent: { ...updated },
    };
  } catch (error) {
    state.logger.error(error, 'change_job_status tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerChangeJobStatusTool(
  server: McpServer,
  state: McpState,
): void {
  server.registerTool(
    'change_job_status',
    {
      description: "Change a job's status (OPEN, DRAFT, CLOSED). Caller must be the original poster.",
      inputSchema: ChangeJobStatusInputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => changeJobStatusHandler(state, args),
  );
}
