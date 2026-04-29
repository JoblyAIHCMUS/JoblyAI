import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeParserService } from './resume-parser.service';
import { ResumeScoringService } from './resume-scoring.service';
import { ProfileSyncService } from './profile-sync.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly parserService: ResumeParserService,
    private readonly scoringService: ResumeScoringService,
    private readonly profileSyncService: ProfileSyncService,
    @InjectQueue('resume-extraction') private readonly extractionQueue: Queue,
    @InjectQueue('resume-scoring') private readonly scoringQueue: Queue,
  ) {}

  @Post('commit-merge')
  @UseGuards(AuthGuard)
  async commitMerge(@Body() body: { resumeId: number; data: any }, @Req() req: any) {
    const userId = req.user.id;
    return this.profileSyncService.commitMerge(userId, body.resumeId, body.data);
  }

  @Post('test-parse')
  @UseInterceptors(FileInterceptor('file'))
  async testParse(@UploadedFile() file: any) {
    this.logger.log(`Received file for parsing test: ${file?.originalname}`);
    
    if (!file) {
      return { error: 'No file uploaded' };
    }

    const text = await this.parserService.extractTextFromPdf(file.buffer);
    const result = await this.parserService.parseResumeText(text);
    return result;
  }

  @Post('test-score')
  @UseInterceptors(FileInterceptor('file'))
  async testScore(@UploadedFile() file: any) {
    this.logger.log(`Received file for scoring test: ${file?.originalname}`);

    if (!file) {
      return { error: 'No file uploaded' };
    }

    const text = await this.parserService.extractTextFromPdf(file.buffer);
    const result = await this.scoringService.evaluateResume(text);
    return result;
  }

  @Post('trigger-analysis')
  @UseGuards(AuthGuard)
  async triggerAnalysis(@Body() body: { resumeId: number }, @Req() req: any) {
    const userId = req.user.id;
    this.logger.log(`Manually triggering full analysis for resume ${body.resumeId} by user ${userId}`);
    
    await this.extractionQueue.add('extract', {
      resumeId: body.resumeId,
      candidateId: userId,
    });

    await this.scoringQueue.add('score', {
      resumeId: body.resumeId,
      candidateId: userId,
    });

    return { success: true, message: 'Analysis triggered' };
  }

  @Post('trigger-parse')
  @UseGuards(AuthGuard)
  async triggerParse(@Body() body: { resumeId: number }, @Req() req: any) {
    const userId = req.user.id;
    this.logger.log(`Manually triggering parse for resume ${body.resumeId} by user ${userId}`);
    
    await this.extractionQueue.add('extract', {
      resumeId: body.resumeId,
      candidateId: userId,
    });

    return { success: true, message: 'Parse triggered' };
  }

  @Post('trigger-score')
  @UseGuards(AuthGuard)
  async triggerScore(@Body() body: { resumeId: number }, @Req() req: any) {
    const userId = req.user.id;
    this.logger.log(`Manually triggering score for resume ${body.resumeId} by user ${userId}`);
    
    await this.scoringQueue.add('score', {
      resumeId: body.resumeId,
      candidateId: userId,
    });

    return { success: true, message: 'Score triggered' };
  }
}

