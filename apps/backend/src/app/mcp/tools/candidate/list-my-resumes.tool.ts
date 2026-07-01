import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';

const outputSchema = z.object({
  resumes: z.array(z.unknown()),
});

export async function listMyResumesHandler(state: McpState) {
  try {
    const resumes = await state.prisma.resume.findMany({
      where: { candidateId: state.userId },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        isDefault: true,
        aiScore: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    const result = { resumes };

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'list_my_resumes tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerListMyResumesTool(server: McpServer, state: McpState): void {
  server.registerTool(
    'list_my_resumes',
    {
      description: "List the candidate's resumes (metadata only).",
      inputSchema: z.object({}),
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => listMyResumesHandler(state)
  );
}
