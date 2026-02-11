import { Injectable } from "@nestjs/common";
import { JobPosting } from "./job-posting.interface";
import { EmploymentType, GetJobsQueryDTO } from "./dto/getJobsQueryDTO";
// import { JobCategory } from "./job-category.interface";

interface PaginatedJobsResponse {
    jobs: JobPosting[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

@Injectable()
export class JobsService {
    // private mockCategories: JobCategory[] = [
    //     {
    //         id: 1,
    //         name: "Software Development",
    //         description: "Software engineering, development, and programming roles",
    //     },
    //     {
    //         id: 2,
    //         name: "Design",
    //         description: "UI/UX, graphic design, and product design roles",
    //     },
    //     {
    //         id: 3,
    //         name: "Data & Analytics",
    //         description: "Data analysis, data science, and business intelligence roles",
    //     },
    // ];

    private mockJobs: JobPosting[] = [
    {
        id: 1,
        employerId: 100,
        categoryId: 1,
        title: "Senior Software Engineer",
        description: "We are looking for an experienced software engineer...",
        location: "San Francisco, CA",
        remote: true,
        type: EmploymentType.FULL_TIME, // Added
        salaryMin: 150000,
        salaryMax: 200000,
        currency: "USD",
        status: "OPEN",
        createdAt: new Date("2026-02-01"),
        updatedAt: new Date("2026-02-11"),
        skills: ["JavaScript", "TypeScript", "Node.js"],
    },
    {
        id: 2,
        employerId: 101,
        categoryId: 2,
        title: "UX/UI Designer",
        description: "Join our design team...",
        location: "New York, NY",
        remote: false,
        type: EmploymentType.CONTRACT, // Added
        salaryMin: 90000,
        salaryMax: 130000,
        currency: "USD",
        status: "OPEN",
        createdAt: new Date("2026-02-05"),
        updatedAt: new Date("2026-02-11"),
        skills: ["Figma", "Adobe XD", "User Research"]
    },
    {
        id: 3,
        employerId: 102,
        categoryId: 3,
        title: "Data Analyst",
        description: "Analyze and visualize complex datasets...",
        location: "Remote",
        remote: true,
        type: EmploymentType.PART_TIME, // Added
        salaryMin: 80000,
        salaryMax: 120000,
        currency: "USD",
        status: "OPEN",
        createdAt: new Date("2026-02-08"),
        updatedAt: new Date("2026-02-10"),
        skills: ["SQL", "Python", "Tableau"]
    },
    {
        id: 4,
        employerId: 103,
        categoryId: 1,
        title: "Frontend Developer",
        description: "Help build responsive and performant web applications...",
        location: "Austin, TX",
        remote: true,
        type: EmploymentType.FULL_TIME, // Added
        salaryMin: 110000,
        salaryMax: 160000,
        currency: "USD",
        status: "CLOSED",
        createdAt: new Date("2026-01-15"),
        updatedAt: new Date("2026-02-03"),
        skills: ["React", "CSS", "HTML"]
    },
    ];

    async getsPaginatedJobsPostings(query: GetJobsQueryDTO) : Promise<PaginatedJobsResponse> {
        const {page = 1, pageSize = 10, q, location, remote, type, skills} = query;
        let filteredJobs = [...this.mockJobs];
        if (q) {
            const search = q.toLowerCase();
            filteredJobs = filteredJobs.filter(job => 
                job.title.toLowerCase().includes(search) || 
                job.description.toLowerCase().includes(search)
            );
        }
        if (location) {
            const loc = location.toLowerCase();
            filteredJobs = filteredJobs.filter(job => 
                job.location.toLowerCase().includes(loc)
            );
        }

        if (remote !== undefined) {
            filteredJobs = filteredJobs.filter(job => job.remote === remote);
        }

        if (type !== undefined) {
            filteredJobs = filteredJobs.filter(job => job.type === type);
        }

        if (skills && skills.length > 0) {
            filteredJobs = filteredJobs.filter(job => 
                skills.every(skill => job.skills.includes(skill))
            );
        }

        const total = filteredJobs.length;
        const startIndex = (page - 1) * pageSize;
        const paginatedJobs = filteredJobs.slice(startIndex, startIndex + pageSize);

        return {
            jobs: paginatedJobs,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }
}