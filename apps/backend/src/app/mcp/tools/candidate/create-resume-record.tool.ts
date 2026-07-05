import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import {
  CreateResumeRecordInputSchema,
  type CreateResumeRecordInput,
} from './candidate.types';

export async function createResumeRecordHandler(
  state: McpState,
  input: CreateResumeRecordInput
) {
  try {
    const resume = await state.prisma.resume.create({
      data: {
        candidateId: state.userId,
        fileKey: input.fileKey,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        isDefault: input.isDefault ?? false,
        isSyncedToProfile: false,
      },
    });

    const result = { resumeId: resume.id };
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'create_resume_record tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerCreateResumeRecordTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'create_resume_record',
    {
      description:
        'Create a Resume DB record after uploading a file to GCS. Step 2 of the resume upload flow.',
      inputSchema: CreateResumeRecordInputSchema,
      outputSchema: z.object({ resumeId: z.number() }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) =>
      createResumeRecordHandler(state, args as CreateResumeRecordInput)
  );
}
