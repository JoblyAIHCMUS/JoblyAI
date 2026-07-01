import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AiGateway } from './ai.gateway';
import { ResumeProcessor } from './processors/resume.processor';
import { ScoringProcessor } from './processors/scoring.processor';
import { InterviewPrepProcessor } from './processors/interview-prep.processor';
import { InterviewPreparationPipeline } from './interview-preparation/pipeline/interview-preparation.pipeline';
import { JDAnalysisService } from './interview-preparation/application/jd-analysis.service';
import { QueryGeneratorService } from './interview-preparation/retrieval/query-generator.service';
import { TavilyProvider } from './interview-preparation/retrieval/tavily-provider.service';
import { QuestionExtractorService } from './interview-preparation/extraction/question-extractor.service';
import { QuestionVerifierService } from './interview-preparation/verification/question-verifier.service';
import { QuestionRankerService } from './interview-preparation/ranking/question-ranker.service';
import { SEARCH_PROVIDER } from './interview-preparation/retrieval/search-provider.token.js';
import { InterviewPromptBuilder } from './interview-preparation/prompts/interview-prompt.builder';
import { AiProviderService } from './ai-provider.service';
import { ResumeParserService } from './resume-parser.service';
import { ResumeScoringService } from './resume-scoring.service';
import { InterviewPrepService } from './interview-prep.service';
import { MatchExplanationService } from './match-explanation.service';
import { ExtractQuestionPromptBuilder } from './interview-preparation/prompts/extract-question.builder';
import { AiController } from './ai.controller';
import { MatchingController } from './matching.controller';
import { InterviewPrepController } from './interview-prep.controller';
import { ProfileSyncService } from './profile-sync.service';
import { MatchingService } from './matching.service';
import { ResumeListener } from './listeners/resume.listener';
import { GcsModule } from '../gcs/gcs.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { JobProcessor } from './processors/job.processor';
import { JobListener } from './listeners/job.listener';
import { PreShortlistEvaluationProcessor } from './processors/pre-shortlist-evaluation.processor';
import { PreShortlistModule } from '../pre-shortlist/pre-shortlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GcsModule,
    AuthModule,
    NotificationsModule,
    forwardRef(() => PreShortlistModule),
    BullModule.registerQueue(
      { name: 'resume-extraction' },
      { name: 'resume-scoring' },
      { name: 'job-embedding' },
      { name: 'interview-prep' }
    ),
  ],
  controllers: [AiController, MatchingController, InterviewPrepController],
  providers: [
    AiGateway,
    ResumeProcessor,
    ScoringProcessor,
    JobProcessor,
    InterviewPrepProcessor,
    InterviewPreparationPipeline,
    JDAnalysisService,
    QueryGeneratorService,
    QuestionExtractorService,
    QuestionVerifierService,
    QuestionRankerService,
    ExtractQuestionPromptBuilder,
    InterviewPromptBuilder,
    {
      provide: SEARCH_PROVIDER,
      useClass: TavilyProvider,
    },
    PreShortlistEvaluationProcessor,
    AiProviderService,
    ResumeParserService,
    ResumeScoringService,
    InterviewPrepService,
    MatchExplanationService,
    ProfileSyncService,
    MatchingService,
    ResumeListener,
    JobListener,
  ],
  exports: [
    AiGateway,
    AiProviderService,
    ResumeParserService,
    ResumeScoringService,
    InterviewPrepService,
    QueryGeneratorService,
    JDAnalysisService,
    QuestionExtractorService,
    QuestionVerifierService,
    QuestionRankerService,   
    MatchExplanationService,
    ProfileSyncService,
    MatchingService,
    SEARCH_PROVIDER,
  ],
})
export class AiModule {}
