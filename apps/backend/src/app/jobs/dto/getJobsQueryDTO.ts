import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType } from '@prisma/client';

export class GetJobsQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  type?: EmploymentType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
