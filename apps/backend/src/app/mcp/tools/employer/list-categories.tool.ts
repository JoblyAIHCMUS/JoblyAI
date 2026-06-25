import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';

const inputSchema = z.object({});
const outputSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    iconKey: z.string().nullable(),
  })
);

export async function listCategoriesHandler(state: McpState) {
  try {
    const categories = await state.prisma.jobCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(categories, null, 2) },
      ],
      structuredContent: categories as unknown as Record<string, unknown>,
    };
  } catch (error) {
    state.logger.error(error, 'list_categories tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerListCategoriesTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'list_categories',
    {
      description: 'List all job categories (id, name, slug, iconKey).',
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => listCategoriesHandler(state)
  );
}
