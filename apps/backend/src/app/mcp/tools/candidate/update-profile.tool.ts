import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Prisma } from '@prisma/client';
import type { McpState } from '../../server/mcp.types';
import {
  UpdateProfileInputSchema,
  type UpdateProfileInput,
} from './candidate.types';

export async function updateProfileHandler(state: McpState, rawInput: unknown) {
  try {
    const input = UpdateProfileInputSchema.parse(
      rawInput
    ) as UpdateProfileInput;

    const create: Prisma.CandidateDescriptionUncheckedCreateInput = {
      candidateId: state.userId,
    };
    const update: Prisma.CandidateDescriptionUpdateInput = {};
    if (input.title !== undefined) {
      create.title = input.title;
      update.title = input.title;
    }
    if (input.bio !== undefined) {
      create.bio = input.bio;
      update.bio = input.bio;
    }

    const description = await state.prisma.candidateDescription.upsert({
      where: { candidateId: state.userId },
      create,
      update,
    });

    const result = {
      id: description.id,
      title: description.title,
      bio: description.bio,
      rawDescriptions: description.rawDescriptions,
      rawTitles: description.rawTitles,
      createdAt: description.createdAt?.toISOString() ?? null,
      updatedAt: description.updatedAt?.toISOString() ?? null,
    };

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'update_profile tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerUpdateProfileTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'update_profile',
    {
      description:
        "Update the candidate's profile (title, bio). Auto-creates if missing.",
      inputSchema: UpdateProfileInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async (args) => updateProfileHandler(state, args)
  );
}
