import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { McpState } from '../server/mcp.types';

export async function whoamiHandler(state: McpState) {
  try {
    const user = await state.prisma.user.findUnique({
      where: { id: state.userId },
      include: {
        employer: true,
        candidateDescription: true,
        resumes: true,
      },
    });

    if (!user) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'User not found' }],
      };
    }

    const result = {
      id: user.id,
      email: user.email,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      role: user.role ?? 'candidate',
      hasCandidateProfile: !!user.candidateDescription || user.resumes.length > 0,
      hasEmployerProfile: !!user.employer,
    };

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'whoami tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerWhoamiTool(server: McpServer, state: McpState): void {
  server.registerTool(
    'whoami',
    {
      description: 'Get the current user profile',
      inputSchema: z.object({}),
      outputSchema: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        role: z.string(),
        hasCandidateProfile: z.boolean(),
        hasEmployerProfile: z.boolean(),
      }),
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
    },
    async () => whoamiHandler(state)
  );
}
