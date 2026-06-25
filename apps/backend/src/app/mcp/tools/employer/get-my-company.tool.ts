import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';

const inputSchema = z.object({});

const outputSchema = z.object({
  companyId: z.number().int().nullable(),
  name: z.string().nullable(),
  slug: z.string().nullable(),
});

export async function getMyCompanyHandler(state: McpState) {
  try {
    const employer = await state.prisma.employer.findUnique({
      where: { employerId: state.userId },
      include: { company: { select: { name: true, slug: true } } },
    });

    const result = employer
      ? {
          companyId: employer.companyId,
          name: employer.company?.name ?? null,
          slug: employer.company?.slug ?? null,
        }
      : { companyId: null, name: null, slug: null };

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: { ...result },
    };
  } catch (error) {
    state.logger.error(error, 'get_my_company tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerGetMyCompanyTool(
  server: McpServer,
  state: McpState,
): void {
  server.registerTool(
    'get_my_company',
    {
      description: "Get the caller's employer company (id, name, slug).",
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => getMyCompanyHandler(state),
  );
}
