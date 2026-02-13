import { Body, Controller, Get, Post, Query, UseGuards, Req } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { GetJobsQueryDTO } from "./dto/getJobsQueryDTO";
import { AuthGuard } from "../auth/auth.guard";
import { CreateJobDto } from "./dto/createJobDTO";
import type { RequestWithUser } from "../../lib/requestWithUser";

@Controller("jobs")
export class JobsController{
    constructor(private readonly jobsService: JobsService) {}

    @Get()
    async getJobs(@Query() query: GetJobsQueryDTO) {
        return this.jobsService.getsPaginatedJobsPostings(query);
    }

    @Post()
    @UseGuards(AuthGuard)
    async createJob(@Body() createJobDto: CreateJobDto, @Req() req: RequestWithUser) {
        const userId = req.user.id;
        return this.jobsService.createJob(createJobDto, userId);
    }
}