import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiGateway } from '../ai.gateway';
import { ResumeParserService } from '../resume-parser.service';
import { ProfileSyncService } from '../profile-sync.service';
import { S3Service } from '../../s3/s3.service';
import { InjectPrisma } from '../../decorators/inject.decorator';
import { PrismaClient } from '@prisma/client';

@Processor('resume-extraction')
export class ResumeProcessor extends WorkerHost {
  private readonly logger = new Logger(ResumeProcessor.name);

  constructor(
    private readonly aiGateway: AiGateway,
    private readonly parserService: ResumeParserService,
    private readonly profileSyncService: ProfileSyncService,
    private readonly s3Service: S3Service,
    @InjectPrisma() private readonly prisma: PrismaClient,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { resumeId, candidateId } = job.data;
    this.logger.log(`Processing resume extraction for ID: ${resumeId}`);

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

      // 4. Parse with Gemini (Extract data + Generate whole-document embedding)
      const result = await this.parserService.parseResumeText(text);
      let data = result.data;
      const embedding = result.embedding;
      
      this.logger.log(`Successfully parsed resume ${resumeId}. Data found: ${!!data}`);

      if (!data) {
        throw new Error(`AI failed to parse resume ${resumeId}`);
      }

      // 4.1 Enrich data with isDuplicate flags using Vector Search / Profile data
      try {
        data = await this.profileSyncService.enrichWithDuplicateFlags(candidateId, data);
        this.logger.log(`Enriched resume ${resumeId} with duplicate flags`);
      } catch (enrichError: any) {
        this.logger.error(`Failed to enrich resume with duplicate flags: ${enrichError.message}`);
        // Continue even if enrichment fails, we still want to save the base data
      }

      // 5. Store draft data (in parsedText field as stringified JSON)
      // and set isSyncedToProfile to false (waiting for user review)
      await this.prisma.resume.update({
        where: { id: resumeId },
        data: {
          parsedText: JSON.stringify(data),
          isSyncedToProfile: false,
        },
      });

      // 6. Update embedding using Raw SQL to bypass Prisma Engine validation
      // This is the most stable way to handle Unsupported types like vector
      if (embedding && embedding.length > 0) {
        try {
          const vectorStr = `[${embedding.join(',')}]`;
          await this.prisma.$executeRawUnsafe(
            `UPDATE resume SET embedding = $1::vector WHERE id = $2`,
            vectorStr,
            resumeId
          );
          this.logger.log(`Successfully saved whole-resume embedding for ID: ${resumeId}`);
        } catch (vectorError: any) {
          this.logger.error(`Failed to save resume vector via Raw SQL: ${vectorError.message}`);
          // Don't throw here, the main data is already saved
        }
      }

      // Emit notification
      this.aiGateway.notifyUser(candidateId, 'RESUME_PARSED', { resumeId });

      return { success: true, resumeId };
    } catch (error: any) {
      this.logger.error(`Failed to process resume ${resumeId}: ${error.message}`);
      throw error;
    }
  }
}

