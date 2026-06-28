// apps/backend/src/app/pre-shortlist/pre-shortlist.service.ts (skeleton + initial methods)
// Note: Task 6 will REPLACE the `buildPrompt` placeholder at the bottom of this file
// with the real implementation shown in Appendix D.

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  ApplicationStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import {
  buildEvaluateAnswersPrompt,
  type EvaluateAnswersOutput,
} from './prompts/evaluate-answers';
import { AiProviderService } from '../ai/ai-provider.service';
import { AiGateway } from '../ai/ai.gateway';
import type { SubmitAnswersRequestDTO } from './dto/submit-answers.dto';

export interface PreShortlistQuestionsView {
  threshold: number;
  questions: { id: string; order: number; question: string }[];
}

export interface PreShortlistApplicationView {
  status: ApplicationStatus;
  threshold: number;
  questions: { id: string; order: number; question: string }[];
  answers: {
    id: string;
    questionId: string;
    answer: string;
    llmComment: string | null;
    llmScore: number | null;
    llmStatus: string | null;
  }[];
  overall: { comment: string; suggestion: string; overallScore: number } | null;
  preShortlistStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | null;
  preShortlistError: string | null;
}

export interface PreShortlistStatusView {
  status: ApplicationStatus;
  answers: { questionId: string; llmStatus: string | null; llmScore: number | null }[];
}

const MAX_QUESTION_LENGTH = 500;
const MAX_QUESTIONS_PER_JOB = 20;
const MIN_ANSWER_LENGTH = 20;
const MAX_ANSWER_LENGTH = 2000;

@Injectable()
export class PreShortlistService {
  private readonly logger = new Logger(PreShortlistService.name);

  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    @InjectQueue('pre-shortlist-evaluation') private readonly evalQueue: Queue,
    private readonly aiProvider: AiProviderService,
    private readonly aiGateway: AiGateway,
  ) {}

  // ---------- Public read APIs ----------

  async getQuestionsForJob(
    jobId: number,
    employerId: string,
  ): Promise<PreShortlistQuestionsView> {
    await this.assertEmployerOwnsJob(jobId, employerId);
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: {
        preShortlistThreshold: true,
        preShortlistQuestions: { orderBy: { order: 'asc' } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return {
      threshold: job.preShortlistThreshold,
      questions: job.preShortlistQuestions.map((q) => ({
        id: q.id,
        order: q.order,
        question: q.question,
      })),
    };
  }

  async getPreShortlistForApplication(
    applicationId: number,
    requester: { id: string; role: string },
  ): Promise<PreShortlistApplicationView> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            postedById: true,
            preShortlistThreshold: true,
            preShortlistQuestions: { orderBy: { order: 'asc' } },
          },
        },
        preShortlistAnswers: true,
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    this.assertCanReadApplication(application, requester);

    const aiFb = (application.aiFeedback ?? {}) as Prisma.JsonObject;
    const overall = (aiFb.preShortlistOverall as Prisma.JsonValue) ?? null;
    const preShortlistStatus = (aiFb.preShortlistStatus as string) ?? null;
    const preShortlistError = (aiFb.preShortlistError as string) ?? null;

    return {
      status: application.status,
      threshold: application.job.preShortlistThreshold,
      questions: application.job.preShortlistQuestions.map((q) => ({
        id: q.id,
        order: q.order,
        question: q.question,
      })),
      answers: application.preShortlistAnswers.map((a) => ({
        id: a.id,
        questionId: a.questionId,
        answer: a.answer,
        llmComment: a.llmComment,
        llmScore: a.llmScore,
        llmStatus: a.llmStatus,
      })),
      overall: this.normalizeOverall(overall),
      preShortlistStatus: this.normalizeStatus(preShortlistStatus),
      preShortlistError,
    };
  }

  async getStatusForApplication(
    applicationId: number,
    requester: { id: string; role: string },
  ): Promise<PreShortlistStatusView> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: { select: { postedById: true } },
        preShortlistAnswers: { select: { questionId: true, llmStatus: true, llmScore: true } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    this.assertCanReadApplication(application, requester);
    return {
      status: application.status,
      answers: application.preShortlistAnswers.map((a) => ({
        questionId: a.questionId,
        llmStatus: a.llmStatus,
        llmScore: a.llmScore,
      })),
    };
  }

  // ---------- Submit answers (candidate) ----------

  async submitAnswers(
    applicationId: number,
    candidateId: string,
    dto: SubmitAnswersRequestDTO,
  ): Promise<{ applicationId: number; status: ApplicationStatus }> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { preShortlistQuestions: { orderBy: { order: 'asc' } } },
        },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.candidateId !== candidateId) {
      throw new ForbiddenException('This application does not belong to you');
    }
    if (application.status !== ApplicationStatus.PRE_SHORTLIST_PENDING) {
      throw new ConflictException(
        `Application is in status ${application.status}; only PRE_SHORTLIST_PENDING can submit answers`,
      );
    }

    const questions = application.job.preShortlistQuestions;
    if (questions.length === 0) {
      throw new BadRequestException('This job has no pre-shortlist questions');
    }
    if (dto.answers.length !== questions.length) {
      throw new BadRequestException(
        `Expected ${questions.length} answers, got ${dto.answers.length}`,
      );
    }

    for (const a of dto.answers) {
      if (a.answer.length < MIN_ANSWER_LENGTH) {
        throw new BadRequestException('Each answer must be at least 20 characters');
      }
      if (a.answer.length > MAX_ANSWER_LENGTH) {
        throw new BadRequestException('Each answer must be at most 2000 characters');
      }
    }

    const knownIds = new Set(questions.map((q) => q.id));
    for (const a of dto.answers) {
      if (!knownIds.has(a.questionId)) {
        throw new BadRequestException(`Unknown questionId: ${a.questionId}`);
      }
    }
    const seen = new Set<string>();
    for (const a of dto.answers) {
      if (seen.has(a.questionId)) {
        throw new BadRequestException(
          `Duplicate answer for questionId: ${a.questionId}`,
        );
      }
      seen.add(a.questionId);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.preShortlistAnswer.deleteMany({ where: { applicationId } });
      await tx.preShortlistAnswer.createMany({
        data: dto.answers.map((a) => ({
          applicationId,
          questionId: a.questionId,
          answer: a.answer,
        })),
      });
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.PRE_SHORTLIST_SUBMITTED,
          aiFeedback: this.mergeAiFeedback(application.aiFeedback, {
            preShortlistStatus: 'PENDING',
            preShortlistError: null,
          }),
        },
      });
    });

    await this.evalQueue.add(
      'evaluate-answers',
      { applicationId },
      { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
    );

    return { applicationId, status: ApplicationStatus.PRE_SHORTLIST_SUBMITTED };
  }

  // ---------- Retry (employer) ----------

  async retryEvaluation(applicationId: number, employerId: string): Promise<void> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { postedById: true } } },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.job.postedById !== employerId) {
      throw new ForbiddenException(
        'You can only retry evaluations for your own jobs',
      );
    }
    if (application.status !== ApplicationStatus.PRE_SHORTLIST_SUBMITTED) {
      throw new BadRequestException(
        'Only submitted applications can be re-evaluated',
      );
    }
    const aiFb = (application.aiFeedback ?? {}) as Prisma.JsonObject;
    if ((aiFb.preShortlistStatus as string) !== 'FAILED') {
      throw new BadRequestException(
        'Retry is only valid after a failed evaluation',
      );
    }
    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        aiFeedback: this.mergeAiFeedback(application.aiFeedback, {
          preShortlistStatus: 'PENDING',
          preShortlistError: null,
        }),
      },
    });
    await this.evalQueue.add(
      'evaluate-answers',
      { applicationId },
      { attempts: 2, backoff: { type: 'exponential', delay: 5000 } },
    );
  }

  // ---------- Helpers used by applications service ----------

  async resolveInitialStatus(
    jobId: number,
    matchPercentage: number | null,
  ): Promise<ApplicationStatus> {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: {
        preShortlistThreshold: true,
        _count: { select: { preShortlistQuestions: true } },
      },
    });
    if (!job) return ApplicationStatus.APPLIED;
    if (
      job.preShortlistThreshold > 0 &&
      job._count.preShortlistQuestions > 0 &&
      (matchPercentage ?? 0) >= job.preShortlistThreshold
    ) {
      return ApplicationStatus.PRE_SHORTLIST_PENDING;
    }
    return ApplicationStatus.APPLIED;
  }

  // ---------- Validation helpers (used by JobsService) ----------

  validateQuestions(questions: string[] | undefined): void {
    if (questions === undefined) return;
    if (questions.length > MAX_QUESTIONS_PER_JOB) {
      throw new BadRequestException(
        `At most ${MAX_QUESTIONS_PER_JOB} questions are allowed`,
      );
    }
    for (const q of questions) {
      if (q.length > MAX_QUESTION_LENGTH) {
        throw new BadRequestException(
          `Each question must be at most ${MAX_QUESTION_LENGTH} characters`,
        );
      }
    }
  }

  // ---------- Internal helpers ----------

  private async assertEmployerOwnsJob(jobId: number, employerId: string): Promise<void> {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { postedById: true },
    });
    if (!job) throw new NotFoundException('Job not found');
    if (job.postedById !== employerId) {
      throw new ForbiddenException('You do not own this job');
    }
  }

  private assertCanReadApplication(
    application: { candidateId: string; job: { postedById: string } },
    requester: { id: string; role: string },
  ): void {
    if (requester.role === 'admin') return;
    if (application.candidateId === requester.id) return;
    if (application.job.postedById === requester.id) return;
    throw new ForbiddenException('You cannot view this pre-shortlist');
  }

  private normalizeOverall(raw: Prisma.JsonValue | null): {
    comment: string;
    suggestion: string;
    overallScore: number;
  } | null {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const o = raw as Record<string, Prisma.JsonValue>;
    if (
      typeof o.comment !== 'string' ||
      typeof o.suggestion !== 'string' ||
      typeof o.overallScore !== 'number'
    ) {
      return null;
    }
    return {
      comment: o.comment,
      suggestion: o.suggestion,
      overallScore: o.overallScore,
    };
  }

  private normalizeStatus(
    raw: string | null,
  ): 'PENDING' | 'COMPLETED' | 'FAILED' | null {
    if (raw === 'PENDING' || raw === 'COMPLETED' || raw === 'FAILED') return raw;
    return null;
  }

  private mergeAiFeedback(
    existing: Prisma.JsonValue | null | undefined,
    patch: Record<string, Prisma.JsonValue>,
  ): Prisma.JsonObject {
    const base: Prisma.JsonObject =
      existing && typeof existing === 'object' && !Array.isArray(existing)
        ? { ...(existing as Prisma.JsonObject) }
        : {};
    return { ...base, ...patch };
  }

  // PLACEHOLDER — Task 6 will replace this with the real implementation in Appendix D.
  buildPrompt(applicationId: number): Promise<string> {
    throw new Error('buildPrompt: not implemented yet — see Task 6');
  }
}
