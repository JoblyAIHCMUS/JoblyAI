import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JDAnalysisService } from '../application/jd-analysis.service.js';
import { QueryGeneratorService } from '../retrieval/query-generator.service.js';
import { type SearchProvider } from '../retrieval/search-provider.interface.js';
import { SEARCH_PROVIDER } from '../retrieval/search-provider.token.js';
import { QuestionVerifierService } from '../verification/question-verifier.service.js';
import { QuestionRankerService } from '../ranking/question-ranker.service.js';
import { GroupedQuestions } from '../dto/public-question.model.js';
import { InterviewPromptBuilder } from '../prompts/interview-prompt.builder.js';
import { AiProviderService } from '../../ai-provider.service.js';
import { PipelineProfiler } from './pipeline-profiler.js';
import { InterviewContext } from '../application/interview-context.model.js';
import { InterviewQuestion } from '../dto/interview-question.model.js';
import Redis from 'ioredis';

@Injectable()
export class InterviewPreparationPipeline {
  private readonly logger = new Logger(InterviewPreparationPipeline.name);

  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly jdAnalysisService: JDAnalysisService,
    private readonly queryGeneratorService: QueryGeneratorService,
    @Inject(SEARCH_PROVIDER) private readonly searchProvider: SearchProvider,
    private readonly questionVerifierService: QuestionVerifierService,
    private readonly questionRankerService: QuestionRankerService,
    private readonly interviewPromptBuilder: InterviewPromptBuilder,
    private readonly aiProvider: AiProviderService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) {}

  async run(jobId: number, resumeId: number): Promise<GroupedQuestions> {
    const profiler = new PipelineProfiler();
    this.logger.debug('=== Interview Preparation Pipeline Started ===');

    // Step 1: Fetch Job and Resume data from database
    profiler.start('fetch_data');
    const [jobData, resumeData] = await Promise.all([
      this.prisma.jobPosting.findUnique({
        where: { id: jobId },
        select: {
          title: true,
          description: true,
          company: { select: { name: true } },
          requirements: {
            select: {
              skill: { select: { name: true } },
              importance: true,
            },
          },
        },
      }),
      this.prisma.resume.findUnique({
        where: { id: resumeId },
        select: { parsedText: true },
      }),
    ]);
    profiler.end();

    if (!jobData || !resumeData) {
      throw new Error('Job or Resume data not found');
    }

    const structuredRequirements = (jobData.requirements ?? []).map(
      (r: { skill: { name: string } | null; importance: string }) => ({
        name: r.skill?.name ?? '',
        importance: r.importance,
      })
    );

    let parsedResume = null;
    if (resumeData.parsedText) {
      try {
        parsedResume = JSON.parse(resumeData.parsedText as string);
      } catch (parseErr: unknown) {
        const message =
          parseErr instanceof Error ? parseErr.message : String(parseErr);
        this.logger.warn(`Failed to parse resume parsedText: ${message}`);
      }
    }

    // Step 2: JD & CV Analysis with Gap Identification (Gemini call or Cache)
    profiler.start('jd_cv_analysis');
    const interviewContext = await this.jdAnalysisService.analyze(
      jobId,
      jobData.title,
      jobData.company?.name ?? null,
      jobData.description,
      structuredRequirements,
      parsedResume
    );
    profiler.end();
    this.logger.debug('Interview Context Inferred:', interviewContext);

    // Step 3: Search Query Generation
    profiler.start('query_generation');
    const searchQueries =
      this.queryGeneratorService.generateSearchQueries(interviewContext);
    profiler.end();
    this.logger.debug('Search Queries:', searchQueries);

    // Step 4: Parallel execution of Web Search and AI Generation
    profiler.start('parallel_generation');
    const cacheKeyWeb = `web_questions:${jobId}`;

    const [webQuestions, aiQuestions] = await Promise.all([
      // Luồng 1: Web Search Grounding (Hoặc đọc từ Cache)
      this.getWebQuestionsCached(cacheKeyWeb, interviewContext, searchQueries),
      // Luồng 2: Personalized AI Generation based on gaps
      this.generatePersonalizedQuestions(interviewContext).catch((err) => {
        this.logger.error(`Personalized AI generation failed: ${err.message}`);
        return [];
      }),
    ]);
    profiler.end();

    // Step 5: Merge and Verify
    profiler.start('verification');
    const merged = [...webQuestions, ...aiQuestions];
    const verifiedQuestions = this.questionVerifierService.verify(merged);
    profiler.end();

    // Step 6: Rank and Group by Difficulty (Easy, Medium, Hard)
    profiler.start('ranking_and_grouping');
    const groupedQuestions = this.questionRankerService.rank(verifiedQuestions);
    profiler.end();

    this.logger.log(
      `Interview Prep Pipeline completed successfully in ${profiler
        .getTotalMs()
        .toFixed(1)}ms. Timings: ${JSON.stringify(profiler.getSummary())}`
    );

    return groupedQuestions;
  }

  private async generatePersonalizedQuestions(
    context: InterviewContext
  ): Promise<InterviewQuestion[]> {
    const prompt = this.interviewPromptBuilder.build(context);
    this.logger.log(
      'Generating personalized AI questions from gap analysis...'
    );
    const result = await this.aiProvider.generateStructuredData<
      InterviewQuestion[]
    >(prompt);
    if (!Array.isArray(result)) {
      return [];
    }
    return result;
  }

  private async getWebQuestionsCached(
    cacheKey: string,
    context: InterviewContext,
    queries: string[]
  ): Promise<InterviewQuestion[]> {
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log(`[Redis] Cache hit for web_questions on Job`);
        return JSON.parse(cached) as InterviewQuestion[];
      }
    } catch (cacheErr: any) {
      this.logger.warn(
        `Failed to read web_questions from Redis: ${cacheErr.message}`
      );
    }

    const webQuestions = await this.searchProvider
      .searchAndExtract(context, queries)
      .catch((err) => {
        this.logger.error(
          `Web search question extraction failed: ${err.message}`
        );
        return [];
      });

    if (webQuestions.length > 0) {
      try {
        await this.redis.set(
          cacheKey,
          JSON.stringify(webQuestions),
          'EX',
          86400
        ); // 24-hour cache
        this.logger.log(`[Redis] Cached web_questions successfully`);
      } catch (cacheErr: any) {
        this.logger.warn(
          `Failed to write web_questions to Redis: ${cacheErr.message}`
        );
      }
    }

    return webQuestions;
  }
}
