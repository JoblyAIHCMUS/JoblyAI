import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { InterviewPrepService } from './interview-prep.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('interview-prep')
@UseGuards(AuthGuard)
export class InterviewPrepController {
  constructor(private prepService: InterviewPrepService) {}

  @Post(':jobId')
  async startPrep(@Param('jobId') jobId: string, @Req() req: any) {
    return this.prepService.getOrCreatePrep(req.user.id, parseInt(jobId));
  }

  @Get(':jobId')
  async getPrep(@Param('jobId') jobId: string, @Req() req: any) {
    return this.prepService.getOrCreatePrep(req.user.id, parseInt(jobId));
  }

  @Post(':jobId/regenerate')
  async regenerate(@Param('jobId') jobId: string, @Req() req: any) {
    return this.prepService.regeneratePrep(req.user.id, parseInt(jobId));
  }
}
