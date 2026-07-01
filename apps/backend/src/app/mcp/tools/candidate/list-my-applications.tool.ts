import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import {
  ListMyApplicationsInputSchema,
  type ListMyApplicationsInput,
} from './candidate.types';

const outputSchema = z.object({
  applications: z.array(z.unknown()),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export async function listMyApplicationsHandler(
  state: McpState,
  rawInput: unknown
) {
  try {
    const input = ListMyApplicationsInputSchema.parse(
      rawInput
    ) as ListMyApplicationsInput;
    const { page, pageSize, status } = input;

    const where = {
      candidateId: state.userId,
      ...(status && { status }),
    };

    const [total, applications] = await Promise.all([
      state.prisma.application.count({ where }),
      state.prisma.application.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            include: {
              category: true,
              company: true,
              postedBy: { select: { id: true, name: true, email: true } },
            },
          },
          resume: {
            select: { id: true, fileKey: true, aiScore: true, isDefault: true },
          },
        },
      }),
    ]);

    const result = {
      applications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'list_my_applications tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerListMyApplicationsTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'list_my_applications',
    {
      description: "List the candidate's own applications (paginated).",
      inputSchema: ListMyApplicationsInputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => listMyApplicationsHandler(state, args)
  );
}
