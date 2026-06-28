// apps/backend/src/app/ai/processors/pre-shortlist-evaluation.processor.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiProviderService } from '../ai-provider.service';
import { PreShortlistService } from '../../pre-shortlist/pre-shortlist.service';
import type { EvaluateAnswersOutput } from '../../pre-shortlist/prompts/evaluate-answers';

@Processor('pre-shortlist-evaluation')
export class PreShortlistEvaluationProcessor extends WorkerHost {
  private readonly logger = new Logger(PreShortlistEvaluationProcessor.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly preShortlistService: PreShortlistService
  ) {
    super();
  }

  async process(job: Job<{ applicationId: number }>): Promise<void> {
    const { applicationId } = job.data;
    this.logger.log(
      `Evaluating pre-shortlist answers for application ${applicationId}`
    );

    let prompt: string;
    try {
      const built = await this.preShortlistService.buildPrompt(applicationId);
      prompt = built.prompt;
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(
        `Failed to build prompt for application ${applicationId}: ${msg}`
      );
      await this.preShortlistService.markEvaluationFailed(
        applicationId,
        `Could not build prompt: ${msg}`
      );
      return;
    }

    let output: EvaluateAnswersOutput;
    try {
      output =
        await this.aiProvider.generateStructuredData<EvaluateAnswersOutput>(
          prompt
        );
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(
        `Gemini call failed for application ${applicationId}: ${msg}`
      );
      await this.preShortlistService.markEvaluationFailed(
        applicationId,
        `AI service error: ${msg}`
      );
      return;
    }

    try {
      await this.preShortlistService.persistEvaluation(applicationId, output);
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(
        `Validation/persist failed for application ${applicationId}: ${msg}`
      );
      await this.preShortlistService.markEvaluationFailed(
        applicationId,
        `Validation failed: ${msg}`
      );
      return;
    }

    this.logger.log(
      `Successfully evaluated pre-shortlist answers for application ${applicationId}`
    );
  }
}
