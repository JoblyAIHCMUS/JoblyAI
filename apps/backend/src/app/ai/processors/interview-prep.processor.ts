import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiGateway } from '../ai.gateway';
import { Inject, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InterviewPreparationPipeline } from '../interview-preparation/pipeline/interview-preparation.pipeline';

@Processor('interview-prep')
export class InterviewPrepProcessor extends WorkerHost {
  private readonly logger = new Logger(InterviewPrepProcessor.name);

  constructor(
    private readonly interviewPreparationPipeline: InterviewPreparationPipeline,
    @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
    private aiGateway: AiGateway
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { candidateId, jobId, resumeId, isRegenerate, excludeQuestions } =
      job.data;

    try {
      this.logger.log(
        `Generating interview questions for candidate ${candidateId} and job ${jobId} (isRegenerate: ${Boolean(
          isRegenerate
        )})`
      );

      const response = await this.interviewPreparationPipeline.run(
        jobId,
        resumeId,
        {
          bypassCache: Boolean(isRegenerate),
          excludeQuestions: Array.isArray(excludeQuestions)
            ? excludeQuestions
            : [],
        }
      );
      this.logger.log('response', response);
      await this.prisma.interviewPreparation.update({
        where: { candidateId_jobId: { candidateId, jobId } },
        data: {
          status: 'COMPLETED',
          questions: response as any, // Cast to any if needed to appease TS for Prisma Json, but usually response is fine
        },
      });

      this.aiGateway.notifyUser(candidateId, 'INTERVIEW_PREP_READY', {
        jobId,
        questions: response,
      });

      this.logger.log(
        `Successfully generated interview questions for candidate ${candidateId} and job ${jobId}`
      );
      return response;
    } catch (error: any) {
      this.logger.error(
        `Failed to generate interview questions: ${error.message}`
      );

      await this.prisma.interviewPreparation
        .update({
          where: { candidateId_jobId: { candidateId, jobId } },
          data: { status: 'FAILED' },
        })
        .catch((err: any) =>
          this.logger.error(`Failed to update status to FAILED: ${err.message}`)
        );

      this.aiGateway.notifyUser(candidateId, 'INTERVIEW_PREP_FAILED', {
        jobId,
        error: error.message,
      });

      throw error;
    }
  }
}
