import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiGateway } from '../ai.gateway';
import { ResumeParserService } from '../resume-parser.service';
import { ResumeScoringService } from '../resume-scoring.service';
import { S3Service } from '../../s3/s3.service';
import { InjectPrisma } from '../../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';

@Processor('resume-scoring')
export class ScoringProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoringProcessor.name);

  constructor(
    private readonly aiGateway: AiGateway,
    private readonly parserService: ResumeParserService,
    private readonly scoringService: ResumeScoringService,
    private readonly s3Service: S3Service,
    @InjectPrisma() private readonly prisma: PrismaClient,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { resumeId, candidateId } = job.data;
    this.logger.log(`Processing resume scoring for ID: ${resumeId}`);

    try {
      // 1. Fetch resume record
      const resume = await this.prisma.resume.findUnique({
        where: { id: resumeId },
      });

      if (!resume || !resume.fileKey) {
        throw new Error(`Resume ${resumeId} not found or missing fileKey`);
      }

      // 2. Download file from S3
      const buffer = await this.s3Service.getFileBuffer(resume.fileKey);

      // 3. Extract text
      const text = await this.parserService.extractTextFromPdf(buffer);

      // 4. Score with Gemini
      const scoringResult = await this.scoringService.evaluateResume(text);
      this.logger.log(`Successfully scored resume ${resumeId}. Score: ${scoringResult?.score}`);

      // 5. Update database - Pass object directly to Json field
      await this.prisma.resume.update({
        where: { id: resumeId },
        data: {
          aiScore: scoringResult.score,
          aiFeedback: scoringResult as any,
        },
      });

      // Emit notification
      this.aiGateway.notifyUser(candidateId, 'RESUME_SCORED', { resumeId });

      return { success: true, resumeId };
    } catch (error: any) {
      this.logger.error(`Failed to score resume ${resumeId}: ${error.message}`);
      throw error;
    }
  }
}
