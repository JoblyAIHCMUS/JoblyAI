import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { GetJobsQueryDTO } from './dto/getJobsQueryDTO';
import { CreateJobDTO } from './dto/createJobDTO';
import { AuthGuard } from '../auth/auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../types/authenticatedRequest';
import { UpdateJobDTO } from './dto/updateJobDTO';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getJobs(@Query() query: GetJobsQueryDTO) {
    return this.jobsService.getsPaginatedJobsPostings(query);
  }

  @Get('categories')
  async getCategories() {
    return this.jobsService.getCategories();
  }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer')
  async createJob(
    @Body() createJobDto: CreateJobDTO,
    @Req() request: AuthenticatedRequest
  ) {
    const userId = request.user.id;
    return this.jobsService.createJob(createJobDto, userId);
  }

  @Get(':id')
  async getJobById(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.getJobById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  async deleteJobById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest
  ) {
    const userId = request.user.id;
    const userRole = request.user.role;
    return this.jobsService.deleteJobById(id, userId, userRole);
  }

  @Get('user/:userId')
  async getJobsByUserId(@Param('userId') userId: string) {
    return this.jobsService.getJobsByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('employer', 'admin')
  async updateJobById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDTO,
    @Req() request: AuthenticatedRequest
  ) {
    const userId = request.user.id;
    const userRole = request.user.role;
    return this.jobsService.updateJobById(id, updateJobDto, userId, userRole);
  }

  @Get('category/:id')
  async getJobsByCategoryId(@Param('id', ParseIntPipe) categoryId: number) {
    return this.jobsService.getJobsByCategoryId(categoryId);
  }
}
