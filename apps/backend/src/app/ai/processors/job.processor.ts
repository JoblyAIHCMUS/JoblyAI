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

      // 3. Update match scores for all applications of this job
      const applications = await this.prisma.application.findMany({
        where: { jobId: jobId },
        select: { id: true, resumeId: true },
      });

      if (applications.length > 0) {
        this.logger.log(
          `Recalculating match scores for ${applications.length} applications for job ${jobId}`
        );

        for (const app of applications) {
          const [sim]: any[] = await this.prisma.$queryRawUnsafe(
            `
            SELECT 1 - (r.embedding <=> j.embedding) as similarity
            FROM "resume" r
            JOIN "JobPosting" j ON j.id = $2
            WHERE r.id = $1 AND r.embedding IS NOT NULL AND j.embedding IS NOT NULL
          `,
            app.resumeId,
            jobId
          );

          if (sim && sim.similarity !== null) {
            await this.prisma.application.update({
              where: { id: app.id },
              data: {
                matchPercentage: parseFloat(
                  (Math.max(0, sim.similarity) * 100).toFixed(2)
                ),
              },
            });
          }
        }
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
