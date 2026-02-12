import { Controller, Get, Query } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { GetJobsQueryDTO } from "./dto/getJobsQueryDTO";

@Controller("jobs")
export class JobsController{
    constructor(private readonly jobsService: JobsService) {}

    @Get()
    async getJobs(@Query() query: GetJobsQueryDTO) {
        return this.jobsService.getsPaginatedJobsPostings(query);
    }
}