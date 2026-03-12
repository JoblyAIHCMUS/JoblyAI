import {
  Controller,
  Get,
  Patch,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { GetEmployerApplicationsQueryDTO } from './dto/getEmployerApplicationsQueryDTO';
import { RejectApplicationDTO } from './dto/rejectApplicationDTO';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';

@Controller('employers/applications')
@UseGuards(AuthGuard, RoleGuard)
@Roles('employer')
export class EmployersApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getApplicationsForEmployer(
    @Query() query: GetEmployerApplicationsQueryDTO,
    @Req() request: AuthenticatedRequest
  ) {
    const employerId = request.user.id;
    return this.applicationsService.getApplicationsForEmployer(
      employerId,
      query
    );
  }

  @Patch(':id/shortlist')
  async shortlistApplication(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest
  ) {
    const employerId = request.user.id;
    return this.applicationsService.shortlistApplication(employerId, id);
  }

  @Patch(':id/reject')
  async rejectApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectApplicationDTO,
    @Req() request: AuthenticatedRequest
  ) {
    const employerId = request.user.id;
    return this.applicationsService.rejectApplication(employerId, id, dto);
  }
}
