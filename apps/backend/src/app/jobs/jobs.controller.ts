import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards, Req } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { GetJobsQueryDTO } from "./dto/getJobsQueryDTO";
import { CreateJobDto } from "./dto/createJobDTO";
import { AuthGuard } from "../auth/auth.guard";
import { RoleGuard } from "../auth/role.guard";
import { Roles } from "../decorators/roles.decorator";
import type { AuthenticatedRequest } from "../types/authenticatedRequest";

@Controller("jobs")
export class JobsController{
    constructor(private readonly jobsService: JobsService) {}

    @Get()
    async getJobs(@Query() query: GetJobsQueryDTO) {
        return this.jobsService.getsPaginatedJobsPostings(query);
    }

    @Post()
    @UseGuards(AuthGuard, RoleGuard)
    @Roles("employer", "admin")
    async createJob(@Body() createJobDto: CreateJobDto, @Req() request: AuthenticatedRequest) {
        const userId = request.user.id;
        return this.jobsService.createJob(createJobDto, userId);
    }

    @Get(":id")
    async getJobById(@Param("id", ParseIntPipe) id: number) {
        return this.jobsService.getJobById(id);
    }

    @Delete(":id")
    @UseGuards(AuthGuard, RoleGuard)
    @Roles("employer", "admin")
    async deleteJobById(@Param("id", ParseIntPipe) id: number, @Req() request: AuthenticatedRequest) {
        const userId = request.user.id;
        const userRole = request.user.role;
        return this.jobsService.deleteJobById(id, userId, userRole);
    }

    @Get("user/:userId")
    async getJobsByUserId(@Param("userId") userId: string) {
        return this.jobsService.getJobsByUserId(userId);
    }
}