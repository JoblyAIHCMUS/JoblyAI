import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeParserService } from './resume-parser.service';
import { ResumeScoringService } from './resume-scoring.service';

@Controller('ai-test')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly parserService: ResumeParserService,
    private readonly scoringService: ResumeScoringService,
  ) {}

  @Post('parse')
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

  @Post('score')
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
}
