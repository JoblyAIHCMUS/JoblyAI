import { z } from 'zod';
import { ApplicationStatus, EmploymentType } from '@prisma/client';

export const SearchJobsInputSchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  type: z.array(z.enum(EmploymentType)).optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'VND', 'JPY', 'CNY']).optional(),
  skills: z.array(z.string()).optional(),
  categories: z.array(z.number().int()).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});
export type SearchJobsInput = z.infer<typeof SearchJobsInputSchema>;

export const ListMyApplicationsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  status: z.enum(ApplicationStatus).optional(),
});
export type ListMyApplicationsInput = z.infer<
  typeof ListMyApplicationsInputSchema
>;
