import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';

const inputSchema = z.object({});
const outputSchema = z.object({
  skills: z.array(z.object({ id: z.number(), name: z.string() })),
});

export async function listSkillsHandler(state: McpState) {
  try {
    const skills = await state.prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(skills, null, 2) },
      ],
      structuredContent: { skills },
    };
  } catch (error) {
    state.logger.error(error, 'list_skills tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerListSkillsTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'list_skills',
    {
      description: 'List all skills (id, name) for use in job requirements.',
      inputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => listSkillsHandler(state)
  );
}
