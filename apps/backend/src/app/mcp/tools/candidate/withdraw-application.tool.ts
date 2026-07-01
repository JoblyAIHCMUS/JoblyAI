import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import {
  WithdrawApplicationInputSchema,
  type WithdrawApplicationInput,
} from './candidate.types';

const include = {
  job: {
    include: {
      category: true,
      company: true,
      postedBy: { select: { id: true, name: true, email: true } },
    },
  },
  resume: {
    select: { id: true, fileKey: true, aiScore: true, isDefault: true },
  },
};

export async function withdrawApplicationHandler(
  state: McpState,
  rawInput: unknown
) {
  try {
    const input = WithdrawApplicationInputSchema.parse(
      rawInput
    ) as WithdrawApplicationInput;
    const { applicationId } = input;

    const application = await state.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.candidateId !== state.userId) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Application not found' }],
      };
    }

    if (application.status !== 'APPLIED') {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Only applications with APPLIED status can be withdrawn',
          },
        ],
      };
    }

    const updated = await state.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
      include,
    });

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(updated, null, 2) },
      ],
      structuredContent: updated,
    };
  } catch (error) {
    state.logger.error(error, 'withdraw_application tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerWithdrawApplicationTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'withdraw_application',
    {
      description:
        'Withdraw an application (only APPLIED status can be withdrawn).',
      inputSchema: WithdrawApplicationInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async (args) => withdrawApplicationHandler(state, args)
  );
}
