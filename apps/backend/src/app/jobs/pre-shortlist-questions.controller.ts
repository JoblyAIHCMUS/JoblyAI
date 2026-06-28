import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';
import { PreShortlistService } from '../pre-shortlist/pre-shortlist.service';
import { AiProviderService } from '../ai/ai-provider.service';
import { GenerateQuestionsRequestDTO } from '../pre-shortlist/dto/generate-questions.dto';
// Mirrored from apps/web/src/features/employer/new-job/prompts/generate-questions.ts.
// The canonical source is the web app; keep both files in sync when editing.
import {
  buildGenerateQuestionsPrompt,
  type GenerateQuestionsOutput,
} from '../pre-shortlist/prompts/generate-questions';

@Controller('jobs/pre-shortlist')
@UseGuards(AuthGuard, RoleGuard)
@Roles('employer')
export class PreShortlistQuestionsController {
  private readonly logger = new Logger(PreShortlistQuestionsController.name);

  constructor(
    private readonly preShortlistService: PreShortlistService,
    private readonly aiProvider: AiProviderService
  ) {}

  @Post('generate-questions')
  @HttpCode(HttpStatus.OK)
  async generateQuestions(
    @Body() dto: GenerateQuestionsRequestDTO
  ): Promise<{ questions: string[] }> {
    if (!dto.title?.trim() || !dto.description?.trim()) {
      throw new BadRequestException('title and description are required');
    }
    const prompt = buildGenerateQuestionsPrompt({
      jobTitle: dto.title,
      jobDescription: dto.description,
      requirements: (dto.requirements ?? []).map((r) => ({
        skillName: r.skillName,
        importance: r.importance,
        minYearsExperience: r.minYearsExperience ?? null,
      })),
    });

    let output: GenerateQuestionsOutput;
    try {
      output =
        await this.aiProvider.generateStructuredData<GenerateQuestionsOutput>(
          prompt
        );
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(`generate-questions Gemini call failed: ${msg}`);
      throw new HttpException(
        { message: 'AI service returned an invalid response', detail: msg },
        HttpStatus.BAD_GATEWAY
      );
    }

    if (
      !output ||
      !Array.isArray(output.questions) ||
      output.questions.length !== 5 ||
      !output.questions.every(
        (q) => typeof q === 'string' && q.trim().length > 0
      )
    ) {
      this.logger.error(
        `generate-questions returned malformed output: ${JSON.stringify(
          output
        )}`
      );
      throw new HttpException(
        { message: 'AI service returned an unexpected response shape' },
        HttpStatus.BAD_GATEWAY
      );
    }

    return { questions: output.questions };
  }

  @Get(':jobId')
  async getQuestions(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Req() request: AuthenticatedRequest
  ) {
    return this.preShortlistService.getQuestionsForJob(jobId, request.user.id);
  }
}
