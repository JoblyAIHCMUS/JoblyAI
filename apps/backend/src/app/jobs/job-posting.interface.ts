
export enum EmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

export interface JobPosting {
    id: number;
    employerId: number;
    categoryId: number;
    title: string;
    description: string;
    location: string;
    remote: boolean;
    type: EmploymentType; // Added
    skills: string[];     // Added
    salaryMin: number;
    salaryMax: number;
    currency: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}