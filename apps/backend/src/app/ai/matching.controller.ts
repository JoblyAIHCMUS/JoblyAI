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
}
