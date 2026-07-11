import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import {
  GetPreShortlistQuestionsInputSchema,
  type GetPreShortlistQuestionsInput,
} from './employer.types';

const outputSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      expectedAnswer: z.string(),
      order: z.number().int().nonnegative(),
    })
  ),
});

export async function getPreShortlistQuestionsHandler(
  state: McpState,
  rawInput: unknown
) {
  try {
    const input = GetPreShortlistQuestionsInputSchema.parse(
      rawInput
    ) as GetPreShortlistQuestionsInput;

    const job = await state.prisma.jobPosting.findUnique({
      where: { id: input.jobId },
      select: {
        companyId: true,
      },
    });

    if (!job) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Job not found' }],
      };
    }

    if (state.companyId !== null && job.companyId !== state.companyId) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Forbidden: job does not belong to your company',
          },
        ],
      };
    }

    const rows = await state.prisma.preShortlistQuestion.findMany({
      where: { jobId: input.jobId },
      orderBy: { order: 'asc' },
    });

    const questions = rows.map((r) => ({
      id: r.id,
      question: r.question,
      expectedAnswer: r.expectedAnswer ?? '',
      order: r.order,
    }));

    const result = { questions };
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'get_pre_shortlist_questions tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerGetPreShortlistQuestionsTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'get_pre_shortlist_questions',
    {
      description:
        'Fetch all pre-shortlist screening questions configured for a job. Returns `id`, `question`, `expectedAnswer`, `order`. Use this before generating new questions to avoid duplicates and to know what to keep.',
      inputSchema: GetPreShortlistQuestionsInputSchema,
      outputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => getPreShortlistQuestionsHandler(state, args)
  );
}
