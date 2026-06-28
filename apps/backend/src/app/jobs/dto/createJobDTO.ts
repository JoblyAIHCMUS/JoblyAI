import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  Max,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmploymentType, RequirementImportance } from '@prisma/client';
import { PreShortlistQuestionInput } from './preShortlistQuestionInput';

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
  location?: string;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  preShortlistThreshold?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PreShortlistQuestionInput)
  preShortlistQuestions?: PreShortlistQuestionInput[];
}
