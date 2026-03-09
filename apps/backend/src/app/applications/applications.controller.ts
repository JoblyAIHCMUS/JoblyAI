import { Controller, Post, Get, Patch, Body, Query, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
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

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('candidate')
  async getApplicationById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest
  ) {
    const candidateId = request.user.id;
    return this.applicationsService.getApplicationById(candidateId, id);
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

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('candidate')
  async withdrawApplication(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest
  ) {
    const candidateId = request.user.id;
    return this.applicationsService.withdrawApplication(candidateId, id);
  }
}
