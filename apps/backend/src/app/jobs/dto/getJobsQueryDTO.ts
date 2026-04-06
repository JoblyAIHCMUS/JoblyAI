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
import { EmploymentType, SortOption } from '@prisma/client';
import { Transform } from 'class-transformer';

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
  sort?: SortOption = 'MOST_RELEVANT';

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Handle: type[]=FULL_TIME&type[]=PART_TIME (already parsed by qs into ['FULL_TIME', 'PART_TIME'])
    if (Array.isArray(value)) {
      return value.filter((v) => v); // Remove empty strings
    }
    // Handle: type=FULL_TIME (single value)
    if (typeof value === 'string') {
      return value.trim() ? [value] : undefined;
    }
    return undefined;
  })
  @IsArray()
  @IsEnum(EmploymentType, { each: true })
  type?: EmploymentType[];

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
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Handle: skills[]=Business&skills[]=Technology (already parsed by qs into ['Business', 'Technology'])
    if (Array.isArray(value)) {
      return value.filter((v) => v); // Remove empty strings
    }
    // Handle: skills=Business (single value)
    if (typeof value === 'string') {
      return value.trim() ? [value] : undefined;
    }
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Handle: categories[]=1&categories[]=2 (already parsed by qs into ['1', '2'])
    if (Array.isArray(value)) {
      return value
        .map((v) => {
          const num = parseInt(v, 10);
          return isNaN(num) ? null : num;
        })
        .filter((v) => v !== null);
    }
    // Handle: categories=1 (single value)
    if (typeof value === 'string') {
      const num = parseInt(value.trim(), 10);
      return isNaN(num) ? undefined : [num];
    }
    return undefined;
  })
  @IsArray()
  @IsInt({ each: true })
  categories?: number[];
}
