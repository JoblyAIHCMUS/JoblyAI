import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MatchingService } from './matching.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetJobsQueryDTO } from '../jobs/dto/getJobsQueryDTO';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

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
  async reRank(
    @Param('id', ParseIntPipe) jobId: number
  ) {
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
}
