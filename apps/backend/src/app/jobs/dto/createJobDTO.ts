import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType, RequirementImportance } from '@prisma/client';

export class JobRequirementInput {
  @IsNumber()
  skillId!: number;

  @IsOptional()
  @IsEnum(RequirementImportance)
  importance?: RequirementImportance;

  @IsOptional()
  @IsNumber()
  minYearsExperience?: number;
}

export class CreateJobDTO {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsEnum(EmploymentType)
  type?: EmploymentType;

  @IsNumber()
  categoryId!: number;

  @IsNumber()
  companyId!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobRequirementInput)
  requirements?: JobRequirementInput[];
}
