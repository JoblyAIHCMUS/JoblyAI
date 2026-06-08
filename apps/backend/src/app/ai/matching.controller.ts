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

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('resume/:id/recommendations')
  @UseGuards(AuthGuard)
  async getRecommendations(
    @Param('id', ParseIntPipe) resumeId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.matchingService.findJobsForResume(resumeId, limit || 10);
  }
}
