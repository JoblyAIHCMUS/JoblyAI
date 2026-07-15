import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import {
  UpdatePreShortlistQuestionInputSchema,
  type UpdatePreShortlistQuestionInput,
} from './employer.types';

const outputSchema = z.object({
  success: z.literal(true),
  questionId: z.string(),
});

export async function updatePreShortlistQuestionHandler(
  state: McpState,
  rawInput: unknown
) {
  try {
    const input = UpdatePreShortlistQuestionInputSchema.parse(
      rawInput
    ) as UpdatePreShortlistQuestionInput;

    const question = await state.prisma.preShortlistQuestion.findUnique({
      where: { id: input.questionId },
      include: {
        job: {
          select: {
            companyId: true,
            _count: { select: { applications: true } },
          },
        },
      },
    });

    if (!question) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Question not found' }],
      };
    }

    if (
      state.companyId !== null &&
      question.job.companyId !== state.companyId
    ) {
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

    if (question.job._count.applications > 0) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Cannot edit pre-shortlist questions after applications exist',
          },
        ],
      };
    }

    const data: { question?: string; expectedAnswer?: string } = {};
    if (input.question !== undefined) data.question = input.question;
    if (input.expectedAnswer !== undefined)
      data.expectedAnswer = input.expectedAnswer;

    await state.prisma.preShortlistQuestion.update({
      where: { id: input.questionId },
      data,
    });

    const result = { success: true as const, questionId: input.questionId };
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'update_pre_shortlist_question tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerUpdatePreShortlistQuestionTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'update_pre_shortlist_question',
    {
      description:
        "Edit the text of a single pre-shortlist question by its id. Use this to refine an AI-generated question or fix a typo. Fails if the job has any applications, if the question doesn't belong to a job owned by the caller, or if neither `question` nor `expectedAnswer` is provided.",
      inputSchema: UpdatePreShortlistQuestionInputSchema,
      outputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => updatePreShortlistQuestionHandler(state, args)
  );
}
