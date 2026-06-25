import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';

const inputSchema = z.object({ id: z.number().int().positive() });

export async function getJobHandler(state: McpState, rawInput: unknown) {
  try {
    const { id } = inputSchema.parse(rawInput);

    const job = await state.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        category: true,
        company: true,
        requirements: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Job not found' }],
      };
    }

    if (state.companyId !== null && job.companyId !== state.companyId) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Forbidden: job does not belong to your company',
          },
        ],
      };
    }

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(job, null, 2) },
      ],
      structuredContent: { ...job },
    };
  } catch (error) {
    state.logger.error(error, 'get_job tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerGetJobTool(
  server: McpServer,
  state: McpState,
): void {
  server.registerTool(
    'get_job',
    {
      description: 'Get a job posting by id (must belong to caller\'s company).',
      inputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => getJobHandler(state, args),
  );
}
