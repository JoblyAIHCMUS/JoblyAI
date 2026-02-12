import { EmploymentType } from '@prisma/client';

export interface JobPosting {
    id: number;
    employerId: number;
    categoryId: number;
    title: string;
    description: string;
    location: string;
    remote: boolean;
    type: EmploymentType; 
    skills: string[];     
    salaryMin: number;
    salaryMax: number;
    currency: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}


export interface PaginatedJobsResponse {
    jobs: JobPosting[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}