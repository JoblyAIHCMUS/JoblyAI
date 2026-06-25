import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import { ListApplicantsInputSchema } from './employer.types';

export async function listApplicantsHandler(
  state: McpState,
  rawInput: unknown
) {
  try {
    const input = ListApplicantsInputSchema.parse(rawInput);
    const { jobId, status, page = 1, pageSize, search } = input;

    const job = await state.prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { id: true, companyId: true },
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

    const where = {
      job: { id: jobId, postedById: state.userId },
      ...(status ? { status } : {}),
      ...(search
        ? {
            candidate: {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };

    const skip = pageSize ? (page - 1) * pageSize : 0;

    const [total, applications] = await state.prisma.$transaction([
      state.prisma.application.count({ where }),
      state.prisma.application.findMany({
        where,
        skip,
        ...(pageSize ? { take: pageSize } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
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
          candidate: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const result = {
      applications,
      total,
      page,
      pageSize: pageSize ?? total,
      totalPages: pageSize ? Math.ceil(total / pageSize) : 1,
    };

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: { ...result },
    };
  } catch (error) {
    state.logger.error(error, 'list_applicants tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerListApplicantsTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'list_applicants',
    {
      description:
        'List applicants for a job. Caller must own the job (jobId is required). Read-only.',
      inputSchema: ListApplicantsInputSchema,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => listApplicantsHandler(state, args)
  );
}
