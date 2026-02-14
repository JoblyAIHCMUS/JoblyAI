import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { GetJobsQueryDTO } from "./dto/getJobsQueryDTO";
import { CreateJobDto } from "./dto/createJobDTO";

@Controller("jobs")
export class JobsController{
    constructor(private readonly jobsService: JobsService) {}

    @Get()
    async getJobs(@Query() query: GetJobsQueryDTO) {
        return this.jobsService.getsPaginatedJobsPostings(query);
    }

    @Post()
    async createJob(@Body() createJobDto: CreateJobDto, @Query("userId") userId: string) {
        return this.jobsService.createJob(createJobDto, userId);
    }
}