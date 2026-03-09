import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDTO } from './dto/createApplicationDTO';
import { GetApplicationsQueryDTO } from './dto/getApplicationsQueryDTO';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';

@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @UseGuards(RoleGuard)
  @Roles('candidate')
  async listApplications(
    @Query() query: GetApplicationsQueryDTO,
    @Req() request: AuthenticatedRequest
  ) {
    const candidateId = request.user.id;
    return this.applicationsService.listApplications(candidateId, query);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Roles('candidate')
  async createApplication(
    @Body() dto: CreateApplicationDTO,
    @Req() request: AuthenticatedRequest
  ) {
    const candidateId = request.user.id;
    return this.applicationsService.createApplication(candidateId, dto);
  }
}
