import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiProviderService } from '../ai-provider.service';
import { InjectPrisma } from '../../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';

@Processor('job-embedding')
export class JobProcessor extends WorkerHost {
  private readonly logger = new Logger(JobProcessor.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    @InjectPrisma() private readonly prisma: PrismaClient
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobId, content } = job.data;
    this.logger.log(`Processing job embedding for ID: ${jobId}`);

    try {
      // 1. Generate embedding with Gemini
      const embedding = await this.aiProvider.generateEmbedding(content);

      if (!embedding || embedding.length === 0) {
        throw new Error(`AI failed to generate embedding for job ${jobId}`);
      }

      // 2. Update database using Raw SQL
      const vectorStr = `[${embedding.join(',')}]`;
      await this.prisma.$executeRawUnsafe(
        `UPDATE "JobPosting" SET embedding = $1::vector WHERE id = $2`,
        vectorStr,
        jobId
      );

      this.logger.log(`Successfully saved embedding for Job: ${jobId}`);

      // 3. Clear match explanations for all applications of this job
      // They will be recalculated with new job data on next access
      const applications = await this.prisma.application.findMany({
        where: { jobId: jobId },
        select: { id: true },
      });

      if (applications.length > 0) {
        this.logger.log(
          `Clearing match explanations for ${applications.length} applications for job ${jobId}`
        );

        await this.prisma.application.updateMany({
          where: { jobId: jobId },
          data: { matchExplanation: undefined },
        });
      }

      return { success: true, jobId };
    } catch (error: any) {
      this.logger.error(
        `Failed to process job embedding ${jobId}: ${error.message}`
      );
      throw error;
    }
  }
}
