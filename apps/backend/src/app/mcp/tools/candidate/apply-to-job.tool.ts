import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Prisma } from '@prisma/client';
import type { McpState } from '../../server/mcp.types';
import { ApplyToJobInputSchema, type ApplyToJobInput } from './candidate.types';
import { NotificationType } from '../../../notifications/notification-type.enum';

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
  candidate: { select: { id: true, name: true, email: true } },
};

export async function applyToJobHandler(state: McpState, rawInput: unknown) {
  try {
    const input = ApplyToJobInputSchema.parse(rawInput) as ApplyToJobInput;
    const { jobId, resumeId } = input;

    const job = await state.prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        status: true,
        postedById: true,
        preShortlistThreshold: true,
      },
    });

    if (!job) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Job not found' }],
      };
    }

    if (job.status !== 'OPEN') {
      return {
        isError: true,
        content: [
          { type: 'text' as const, text: 'Job is not open for applications' },
        ],
      };
    }

    let resume;
    if (resumeId !== undefined) {
      resume = await state.prisma.resume.findUnique({
        where: { id: resumeId },
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
          content: [
            { type: 'text' as const, text: 'Resume does not belong to you' },
          ],
        };
      }
    } else {
      resume = await state.prisma.resume.findFirst({
        where: { candidateId: state.userId, isDefault: true },
      });
      if (!resume) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: 'No default resume; specify resumeId',
            },
          ],
        };
      }
    }

    const existing = await state.prisma.application.findFirst({
      where: { jobId, candidateId: state.userId },
    });

    const activeStatuses = [
      'APPLIED',
      'PRE_SHORTLIST_PENDING',
      'PRE_SHORTLIST_SUBMITTED',
      'INTERVIEW',
      'OFFER',
    ];
    if (
      existing &&
      (activeStatuses.includes(existing.status) ||
        existing.status === 'REJECTED')
    ) {
      return {
        isError: true,
        content: [
          { type: 'text' as const, text: 'Already applied to this job' },
        ],
      };
    }

    let application;
    if (existing && existing.status === 'WITHDRAWN') {
      application = await state.prisma.application.update({
        where: { id: existing.id },
        data: {
          status: 'APPLIED',
          resumeId: resume.id,
          matchPercentage: null,
          aiFeedback: Prisma.JsonNull,
          updatedAt: new Date(),
        },
        include,
      });
    } else {
      application = await state.prisma.application.create({
        data: {
          jobId,
          candidateId: state.userId,
          resumeId: resume.id,
          status: 'APPLIED',
        },
        include,
      });
    }

    try {
      await state.matchExplanationService.calculateExplanation(application.id);
    } catch (err) {
      state.logger.error(
        { err, applicationId: application.id },
        'match explanation failed'
      );
    }

    const withScore = await state.prisma.application.findUnique({
      where: { id: application.id },
      select: { matchPercentage: true },
    });

    const jobWithCount = await state.prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { _count: { select: { preShortlistQuestions: true } } },
    });

    const initialStatus =
      job &&
      job.preShortlistThreshold > 0 &&
      (jobWithCount?._count.preShortlistQuestions ?? 0) > 0 &&
      (withScore?.matchPercentage ?? 0) >= job.preShortlistThreshold
        ? 'PRE_SHORTLIST_PENDING'
        : 'APPLIED';

    if (initialStatus !== application.status) {
      application = await state.prisma.application.update({
        where: { id: application.id },
        data: { status: initialStatus },
        include,
      });
    }

    try {
      state.eventEmitter.emit('job.viewed', { jobId });
    } catch (err) {
      state.logger.error({ err, jobId }, 'failed to emit job.viewed for apply');
    }

    try {
      await state.notificationsService.createNotifications([
        {
          recipientId: job.postedById,
          type: NotificationType.NEW_APPLICATION,
          title: 'New Job Application',
          content: `A new candidate has applied for your job: ${job.title}`,
          link: `/employer/all-applications/${application.id}`,
          metadata: { applicationId: application.id, jobId },
        },
        {
          recipientId: state.userId,
          type: NotificationType.APPLICATION_SUBMITTED,
          title: 'Application Submitted',
          content: `You have successfully applied for ${job.title}`,
          link: `/candidate/find-jobs/${jobId}`,
          metadata: { applicationId: application.id, jobId },
        },
      ]);
    } catch (err) {
      state.logger.error(
        { err, applicationId: application.id },
        'failed to create apply notifications'
      );
    }

    const fresh = await state.prisma.application.findUnique({
      where: { id: application.id },
      include,
    });

    if (!fresh) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Internal error' }],
      };
    }

    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(fresh, null, 2) },
      ],
      structuredContent: { ...fresh },
    };
  } catch (error) {
    state.logger.error(error, 'apply_to_job tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerApplyToJobTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'apply_to_job',
    {
      description:
        'Apply to a job. Auto-uses default resume if resumeId omitted. Re-applies after withdrawal.',
      inputSchema: ApplyToJobInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: false,
      },
    },
    async (args) => applyToJobHandler(state, args)
  );
}
