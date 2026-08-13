import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import { ListJobsInputSchema, type ListJobsInput } from './employer.types';

const outputSchema = z.object({
  jobs: z.array(z.unknown()),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export async function listJobsHandler(state: McpState, rawInput: unknown) {
  try {
    const input = ListJobsInputSchema.parse(rawInput) as ListJobsInput;
    const { page, pageSize } = input;

    const [total, jobs] = await state.prisma.$transaction([
      state.prisma.jobPosting.count({
        where: { postedById: state.userId, deletedAt: null },
      }),
      state.prisma.jobPosting.findMany({
        where: { postedById: state.userId, deletedAt: null },
        include: {
          category: true,
          company: true,
          requirements: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      { timeout: 60000 },
    ]);

    const result = {
      jobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: { ...result },
    };
  } catch (error) {
    state.logger.error(error, 'list_jobs tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerListJobsTool(server: McpServer, state: McpState): void {
  server.registerTool(
    'list_jobs',
    {
      description: "List the caller's job postings (paginated, all statuses).",
      inputSchema: ListJobsInputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => listJobsHandler(state, args)
  );
}
