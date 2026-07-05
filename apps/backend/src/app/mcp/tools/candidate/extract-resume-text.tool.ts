import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import {
  ExtractResumeTextInputSchema,
  type ExtractResumeTextInput,
} from './candidate.types';

export async function extractResumeTextHandler(
  state: McpState,
  input: ExtractResumeTextInput
) {
  try {
    const resume = await state.prisma.resume.findUnique({
      where: { id: input.resumeId },
    });
    if (!resume) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Resume not found' }],
      };
    }
    if (resume.candidateId !== state.userId) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Access denied' }],
      };
    }
    if (!resume.fileKey) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Resume has no fileKey' }],
      };
    }

    const buffer = await state.gcsService.getFileBuffer(resume.fileKey);
    const { text, pageCount } =
      await state.resumeParserService.extractTextFromPdf(buffer);

    const result = { text, pageCount, isEmpty: text.length < 50 };
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'extract_resume_text tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerExtractResumeTextTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'extract_resume_text',
    {
      description:
        'Get the raw text of a resume PDF so the agent can parse it locally. Step 3a of the upload flow.',
      inputSchema: ExtractResumeTextInputSchema,
      outputSchema: z.object({
        text: z.string(),
        pageCount: z.number(),
        isEmpty: z.boolean(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) =>
      extractResumeTextHandler(state, args as ExtractResumeTextInput)
  );
}
