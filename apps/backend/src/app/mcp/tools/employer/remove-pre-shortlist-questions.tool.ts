import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import {
  RemovePreShortlistQuestionsInputSchema,
  type RemovePreShortlistQuestionsInput,
} from './employer.types';

const outputSchema = z.object({
  removed: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
});

export async function removePreShortlistQuestionsHandler(
  state: McpState,
  rawInput: unknown
) {
  try {
    const input = RemovePreShortlistQuestionsInputSchema.parse(
      rawInput
    ) as RemovePreShortlistQuestionsInput;

    const job = await state.prisma.jobPosting.findUnique({
      where: { id: input.jobId },
      select: {
        companyId: true,
        _count: { select: { applications: true } },
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

    if (job._count.applications > 0) {
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

    const found = await state.prisma.preShortlistQuestion.findMany({
      where: { id: { in: input.questionIds }, jobId: input.jobId },
      select: { id: true },
    });

    if (found.length !== input.questionIds.length) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Some questionIds do not belong to this job',
          },
        ],
      };
    }

    const result = await state.prisma.$transaction(async (tx) => {
      await tx.preShortlistQuestion.deleteMany({
        where: { id: { in: input.questionIds } },
      });
      const remaining = await tx.preShortlistQuestion.findMany({
        where: { jobId: input.jobId },
        orderBy: { order: 'asc' },
        select: { id: true },
      });
      for (let i = 0; i < remaining.length; i++) {
        await tx.preShortlistQuestion.update({
          where: { id: remaining[i].id },
          data: { order: i },
        });
      }
      return { removed: input.questionIds.length, remaining: remaining.length };
    });

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'remove_pre_shortlist_questions tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerRemovePreShortlistQuestionsTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'remove_pre_shortlist_questions',
    {
      description:
        'Delete one or more pre-shortlist questions by id. Remaining questions are auto-renumbered (the `order` field is compacted to 0, 1, 2, ...). Fails if the job has any applications, if any `questionIds` don\'t belong to the job, or on cross-company attempts.',
      inputSchema: RemovePreShortlistQuestionsInputSchema,
      outputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => removePreShortlistQuestionsHandler(state, args)
  );
}
