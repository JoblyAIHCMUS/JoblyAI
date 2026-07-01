import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchExplanationService } from './match-explanation.service';
import { AuthGuard } from '../auth/auth.guard';
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
    @Query() query: GetJobsQueryDTO
  ) {
    return this.matchingService.findJobsForResume(resumeId, query);
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
    const cached = await this.matchExplanationService.getExplanation(id, scoringMode);
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
    return this.matchExplanationService.calculateExplanation(id, body.scoringMode);
  }
}
