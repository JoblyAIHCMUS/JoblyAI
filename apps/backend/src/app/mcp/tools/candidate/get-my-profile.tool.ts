import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';

const outputSchema = z.object({
  id: z.number().int().nullable(),
  title: z.string().nullable(),
  bio: z.string().nullable(),
  rawDescriptions: z.unknown().nullable(),
  rawTitles: z.unknown().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export async function getMyProfileHandler(state: McpState) {
  try {
    const description = await state.prisma.candidateDescription.findUnique({
      where: { candidateId: state.userId },
    });

    const result = description
      ? {
          id: description.id,
          title: description.title,
          bio: description.bio,
          rawDescriptions: description.rawDescriptions,
          rawTitles: description.rawTitles,
          createdAt: description.createdAt?.toISOString() ?? null,
          updatedAt: description.updatedAt?.toISOString() ?? null,
        }
      : {
          id: null,
          title: null,
          bio: null,
          rawDescriptions: null,
          rawTitles: null,
          createdAt: null,
          updatedAt: null,
        };

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'get_my_profile tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerGetMyProfileTool(server: McpServer, state: McpState): void {
  server.registerTool(
    'get_my_profile',
    {
      description: "Get the candidate's profile (CandidateDescription).",
      inputSchema: z.object({}),
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => getMyProfileHandler(state)
  );
}
