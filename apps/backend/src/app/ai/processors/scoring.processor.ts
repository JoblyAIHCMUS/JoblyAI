import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiGateway } from '../ai.gateway';
import { ResumeParserService } from '../resume-parser.service';
import { ResumeScoringService } from '../resume-scoring.service';
import { S3Service } from '../../s3/s3.service';
import { InjectPrisma } from '../../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/notification-type.enum';

@Processor('resume-scoring')
export class ScoringProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoringProcessor.name);

  constructor(
    private readonly aiGateway: AiGateway,
    private readonly parserService: ResumeParserService,
    private readonly scoringService: ResumeScoringService,
    private readonly s3Service: S3Service,
    private readonly notificationsService: NotificationsService,
    @InjectPrisma() private readonly prisma: PrismaClient
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
      this.logger.log(`Calling scoring service for resume ${resumeId}...`);
      const scoringResult = await this.scoringService.evaluateResume(text);

      if (!scoringResult) {
        throw new Error(`AI returned no scoring result for resume ${resumeId}`);
      }

      this.logger.log(
        `Successfully scored resume ${resumeId}. Raw Score: ${scoringResult?.score}`
      );

      // 5. Update database - Ensure score is a float
      const finalScore =
        typeof scoringResult.score === 'string'
          ? parseFloat(scoringResult.score)
          : scoringResult.score;

      if (isNaN(finalScore)) {
        this.logger.warn(
          `AI returned an invalid score: ${scoringResult.score}. Defaulting to 0.`
        );
      }

      await this.prisma.resume.update({
        where: { id: resumeId },
        data: {
          aiScore: isNaN(finalScore) ? 0 : finalScore,
          aiFeedback: scoringResult as any,
        },
      });

      this.logger.log(
        `Updated database for resume ${resumeId} with score ${finalScore}`
      );

      // Emit real-time notification via Socket.io
      this.aiGateway.notifyUser(candidateId, 'RESUME_SCORED', { resumeId });

      // Create persistent notification in database
      try {
        await this.notificationsService.createNotification({
          recipientId: candidateId,
          type: NotificationType.AI_RESUME_SCORED,
          title: 'AI Scoring Complete',
          content:
            'Your CV has been evaluated with a strategic score. View feedback now.',
          link: `/candidate/profile?openFeedbackModal=${resumeId}`,
          metadata: { resumeId, score: finalScore },
        });
      } catch (notifyError: any) {
        this.logger.error(
          `Failed to create persistent notification: ${notifyError.message}`
        );
      }

      return { success: true, resumeId };
    } catch (error: any) {
      this.logger.error(`Failed to score resume ${resumeId}: ${error.message}`);
      throw error;
    }
  }
}
