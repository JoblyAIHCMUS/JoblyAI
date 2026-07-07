import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JDAnalysisService } from '../application/jd-analysis.service.js';
import { QueryGeneratorService } from '../retrieval/query-generator.service.js';
import { type SearchProvider } from '../retrieval/search-provider.interface.js';
import { SEARCH_PROVIDER } from '../retrieval/search-provider.token.js';
import { QuestionVerifierService } from '../verification/question-verifier.service.js';
import { QuestionRankerService } from '../ranking/question-ranker.service.js';
import { PublicQuestion } from '../dto/public-question.model.js';

@Injectable()
export class InterviewPreparationPipeline {
  private readonly logger = new Logger(InterviewPreparationPipeline.name);
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
    private readonly jdAnalysisService: JDAnalysisService,
    private readonly queryGeneratorService: QueryGeneratorService,
    @Inject(SEARCH_PROVIDER) private readonly searchProvider: SearchProvider,
    private readonly questionVerifierService: QuestionVerifierService,
    private readonly questionRankerService: QuestionRankerService
  ) {}

  async run(jobId: number, resumeId: number): Promise<PublicQuestion[]> {
    const [jobData, resumeData] = await Promise.all([
      this.prisma.jobPosting.findUnique({
        where: { id: jobId },
        select: {
          title: true,
          description: true,
          company: { select: { name: true } },
        },
      }),
      this.prisma.resume.findUnique({
        where: { id: resumeId },
        select: { parsedText: true },
      }),
    ]);
    this.logger.debug('=== Interview Preparation Pipeline Started ===');
    this.logger.debug('Job Data:', jobData);
    this.logger.debug('Resume Data:', resumeData);

    if (!jobData || !resumeData) {
      throw new Error('Job or Resume data not found');
    }

    const interviewContext = this.jdAnalysisService.analyze(
      jobData.title,
      jobData.company?.name ?? null,
      jobData.description
    );
    this.logger.debug('=== Interview Context Generated ===');
    this.logger.debug('Interview Context:', interviewContext);

    const searchQueries =
      this.queryGeneratorService.generateSearchQueries(interviewContext);
    this.logger.debug('=== Search Queries Generated ===');
    this.logger.debug('Search Queries:', searchQueries);

    const interviewQuestions = await this.searchProvider.searchAndExtract(
      jobData.company?.name ?? null,
      jobData.title,
      jobData.description,
      searchQueries
    );
    this.logger.debug('=== Questions Extracted from Search ===');
    this.logger.debug('Interview Questions:', interviewQuestions);

    const verifiedQuestions =
      this.questionVerifierService.verify(interviewQuestions);
    this.logger.debug('=== Questions Verified ===');
    this.logger.debug('Verified Questions:', verifiedQuestions);

    const rankedQuestions = this.questionRankerService.rank(verifiedQuestions);
    this.logger.debug('=== Questions Ranked ===');
    this.logger.debug('Ranked Questions:', rankedQuestions);

    return rankedQuestions.map((q) => ({
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      relevance: q.relevance,
      confidence: q.confidence,
      sources: q.sources,
    }));
  }
}
