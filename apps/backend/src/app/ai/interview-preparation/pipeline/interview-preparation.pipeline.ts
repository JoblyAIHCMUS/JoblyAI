import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AiProviderService } from '../../ai-provider.service';
import { InterviewPromptBuilder } from '../prompts/interview-prompt.builder.js';

type InterviewPreparationOutput = {
  easy: Array<{
    question: string;
    sampleAnswer: string;
    interviewerIntent: string;
    tips: string;
  }>;
  medium: Array<{
    question: string;
    sampleAnswer: string;
    interviewerIntent: string;
    tips: string;
  }>;
  hard: Array<{
    question: string;
    sampleAnswer: string;
    interviewerIntent: string;
    tips: string;
  }>;
};

@Injectable()
export class InterviewPreparationPipeline {
  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly promptBuilder: InterviewPromptBuilder,
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient
  ) {}

  async run(jobId: number, resumeId: number): Promise<InterviewPreparationOutput> {
    const [jobData, resumeData] = await Promise.all([
      this.prisma.jobPosting.findUnique({
        where: { id: jobId },
        select: { title: true, description: true },
      }),
      this.prisma.resume.findUnique({
        where: { id: resumeId },
        select: { parsedText: true },
      }),
    ]);

    if (!jobData || !resumeData) {
      throw new Error('Job or Resume data not found');
    }

    const prompt = this.promptBuilder.build(jobData, resumeData);

    return this.aiProvider.generateStructuredData<InterviewPreparationOutput>(prompt);
  }
}