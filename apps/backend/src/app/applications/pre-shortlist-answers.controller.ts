// apps/backend/src/app/applications/pre-shortlist-answers.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';
import { PreShortlistService } from '../pre-shortlist/pre-shortlist.service';
import { SubmitAnswersRequestDTO } from '../pre-shortlist/dto/submit-answers.dto';

@Controller('applications')
@UseGuards(AuthGuard)
export class PreShortlistAnswersController {
  constructor(private readonly preShortlistService: PreShortlistService) {}

  @Get(':id/pre-shortlist')
  @UseGuards(RoleGuard)
  @Roles('candidate', 'employer')
  async get(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.preShortlistService.getPreShortlistForApplication(id, {
      id: request.user.id,
      role: request.user.role,
    });
  }

  @Post(':id/pre-shortlist/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard)
  @Roles('candidate')
  async submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitAnswersRequestDTO,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.preShortlistService.submitAnswers(
      id,
      request.user.id,
      dto,
    );
  }

  @Get(':id/pre-shortlist/status')
  @UseGuards(RoleGuard)
  @Roles('candidate', 'employer')
  async status(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.preShortlistService.getStatusForApplication(id, {
      id: request.user.id,
      role: request.user.role,
    });
  }

  @Post(':id/pre-shortlist/retry')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RoleGuard)
  @Roles('employer')
  async retry(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.preShortlistService.retryEvaluation(id, request.user.id);
    return { ok: true };
  }
}
