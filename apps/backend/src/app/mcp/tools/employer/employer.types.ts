import { z } from 'zod';
import {
  JobStatus,
  EmploymentType,
  RequirementImportance,
  ApplicationStatus,
} from '@prisma/client';

export const JobRequirementInputSchema = z.object({
  skillId: z.number().int().positive(),
  importance: z.enum(RequirementImportance).optional(),
  minYearsExperience: z.number().int().min(0).optional(),
});
export type JobRequirementInput = z.infer<typeof JobRequirementInputSchema>;

export const CreateJobInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.number().int().positive(),
  requirements: z.array(JobRequirementInputSchema).optional(),
  location: z.string().optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  currency: z.string().optional(),
  remote: z.boolean().optional(),
  type: z.enum(EmploymentType).optional(),
});
export type CreateJobInput = z.infer<typeof CreateJobInputSchema>;

export const UpdateJobInputSchema = CreateJobInputSchema.partial().extend({
  id: z.number().int().positive(),
  status: z.enum(JobStatus).optional(),
});
export type UpdateJobInput = z.infer<typeof UpdateJobInputSchema>;

export const ChangeJobStatusInputSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(JobStatus),
});
export type ChangeJobStatusInput = z.infer<typeof ChangeJobStatusInputSchema>;

export const ListJobsInputSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(10),
});
export type ListJobsInput = z.infer<typeof ListJobsInputSchema>;

export const GetJobInputSchema = z.object({
  id: z.number().int().positive(),
});

export const ListApplicantsInputSchema = z.object({
  jobId: z.number().int().positive(),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional(),
  status: z.enum(ApplicationStatus).optional(),
  search: z.string().optional(),
});
export type ListApplicantsInput = z.infer<typeof ListApplicantsInputSchema>;
