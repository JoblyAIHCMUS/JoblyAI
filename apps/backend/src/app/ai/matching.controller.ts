import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchExplanationService } from './match-explanation.service';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';
import { GetJobsQueryDTO } from '../jobs/dto/getJobsQueryDTO';

@Controller('matching')
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly matchExplanationService: MatchExplanationService
  ) {}

  @Get('resume/:id/recommendations')
  @UseGuards(AuthGuard)
  async getRecommendations(
    @Param('id', ParseIntPipe) resumeId: number,
    @Query() query: GetJobsQueryDTO,
    @Req() request: AuthenticatedRequest
  ) {
    const result = await this.matchingService.findJobsForResume(
      resumeId,
      query
    );

    if (result.jobs.length === 0) {
      return result;
    }

    const enrichedJobs = await Promise.all(
      result.jobs.map(async (job) => {
        const explanation =
          await this.matchExplanationService.getJobResumeMatchExplanation(
            job.id,
            resumeId,
            request.user.id
          );
        return {
          ...job,
          matchPercentage: explanation.overallScore,
        };
      })
    );

    // For MOST_RELEVANT, the SQL ORDER BY used global distance; re-sort
    // within the page by the per-requirement average so the badge order
    // matches the score the user sees on the detail page.
    if (query.sort === undefined || query.sort === 'MOST_RELEVANT') {
      enrichedJobs.sort(
        (a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
      );
    }

    return {
      ...result,
      jobs: enrichedJobs,
    };
  }

  @Get('job/:id/rerank')
  @UseGuards(AuthGuard)
  async reRank(@Param('id', ParseIntPipe) jobId: number) {
    return this.matchingService.reRankApplicants(jobId);
  }

  @Get('job/:id/matches')
  @UseGuards(AuthGuard)
  async getJobMatches(
    @Param('id', ParseIntPipe) jobId: number,
    @Query() query: any
  ) {
    return this.matchingService.findMatchingCandidatesForJob(jobId, query);
  }

  @Get('application/:id/explanation')
  @UseGuards(AuthGuard)
  async getMatchExplanation(
    @Param('id', ParseIntPipe) id: number,
    @Query('scoringMode') scoringMode?: 'exact' | 'embedding'
  ) {
    const cached = await this.matchExplanationService.getExplanation(
      id,
      scoringMode
    );
    if (cached) {
      return cached;
    }
    return this.matchExplanationService.calculateExplanation(id, scoringMode);
  }

  @Post('application/:id/recalculate')
  @UseGuards(AuthGuard)
  async recalculateExplanation(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { scoringMode?: 'exact' | 'embedding' }
  ) {
    return this.matchExplanationService.calculateExplanation(
      id,
      body.scoringMode
    );
  }

  @Get('job/:jobId/resume/:resumeId/explanation')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('candidate')
  async getCandidateJobResumeExplanation(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Param('resumeId', ParseIntPipe) resumeId: number,
    @Req() request: AuthenticatedRequest
  ) {
    return this.matchExplanationService.getJobResumeMatchExplanation(
      jobId,
      resumeId,
      request.user.id
    );
  }
}
