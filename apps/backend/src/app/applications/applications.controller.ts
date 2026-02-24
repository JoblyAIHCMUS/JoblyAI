import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDTO } from './dto/createApplicationDTO';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';

@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

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
