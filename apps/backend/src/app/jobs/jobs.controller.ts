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
import { EventEmitter2 } from '@nestjs/event-emitter';
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
  constructor(
    private readonly jobsService: JobsService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Get()
  async getJobs(@Query() query: GetJobsQueryDTO) {
    return this.jobsService.getsPaginatedJobsPostings(query);
  }

  @Get('categories')
  async getCategories() {
    return this.jobsService.getCategories();
  }

  @Get('analytics/views')
  @UseGuards(AuthGuard)
  async getJobViewsAnalytics(
    @Req() request: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day'
  ) {
    const userId = request.user.id;

    // Parse dates as local time (YYYY-MM-DD format)
    // End date should be inclusive (end of day 23:59:59.999)
    let end: Date;
    let start: Date;

    if (endDate) {
      const [year, month, day] = endDate.split('-').map(Number);
      end = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    if (startDate) {
      const [year, month, day] = startDate.split('-').map(Number);
      start = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    }

    return this.jobsService.getJobViewsAnalytics(userId, start, end, groupBy);
  }

  @Get('analytics/applications')
  @UseGuards(AuthGuard)
  async getJobApplicationsAnalytics(
    @Req() request: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day'
  ) {
    const userId = request.user.id;

    // Parse dates as local time (YYYY-MM-DD format)
    // End date should be inclusive (end of day 23:59:59.999)
    let end: Date;
    let start: Date;

    if (endDate) {
      const [year, month, day] = endDate.split('-').map(Number);
      end = new Date(year, month - 1, day, 23, 59, 59, 999);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    if (startDate) {
      const [year, month, day] = startDate.split('-').map(Number);
      start = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    }

    return this.jobsService.getJobApplicationsAnalytics(
      userId,
      start,
      end,
      groupBy
    );
  }

  @Get('user/:userId')
  async getJobsByUserId(
    @Param('userId') userId: string,
    @Query() query: Partial<GetJobsQueryDTO>
  ) {
    return this.jobsService.getJobsByUserId(userId, query);
  }

  @Get('company/:companyId')
  async getJobsByCompanyId(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query() query: Partial<GetJobsQueryDTO>
  ) {
    return this.jobsService.getJobsByCompanyId(companyId, query);
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
    const job = await this.jobsService.getJobById(id);
    // Emit job viewed event for analytics tracking
    this.eventEmitter.emit('job.viewed', { jobId: id });
    return job;
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
