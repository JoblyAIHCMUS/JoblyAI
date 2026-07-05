import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { GcsFolder } from '../../../gcs/gcs.interface';
import type { McpState } from '../../server/mcp.types';
import {
  GenerateUploadUrlInputSchema,
  type GenerateUploadUrlInput,
} from './candidate.types';

export async function generateUploadUrlHandler(
  state: McpState,
  input: GenerateUploadUrlInput
) {
  try {
    const result = await state.gcsService.generatePresignedUploadUrl(
      input.fileName,
      input.fileType,
      GcsFolder.RESUMES
    );

    const output = {
      uploadUrl: result.uploadUrl,
      fileKey: result.fileKey,
      fileUrl: result.fileUrl,
      expiresIn: result.expiresIn,
    };
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(output, null, 2) },
      ],
      structuredContent: output,
    };
  } catch (error) {
    state.logger.error(error, 'generate_upload_url tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerGenerateUploadUrlTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'generate_upload_url',
    {
      description:
        'Get a presigned GCS URL to upload a resume file (PDF or DOCX). Step 1 of the resume upload flow.',
      inputSchema: GenerateUploadUrlInputSchema,
      outputSchema: z.object({
        uploadUrl: z.string(),
        fileKey: z.string(),
        fileUrl: z.string(),
        expiresIn: z.number(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) =>
      generateUploadUrlHandler(
        state,
        args as GenerateUploadUrlInput
      )
  );
}
