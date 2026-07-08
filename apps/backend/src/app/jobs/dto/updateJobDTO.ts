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
import {
  EmploymentType,
  RequirementImportance,
  JobStatus,
} from '@prisma/client';
import { PreShortlistQuestionInput } from './preShortlistQuestionInput';
import { CreateLocationDto } from '../../location/dto/create-location.dto';

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

export class UpdateJobDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  location?: CreateLocationDto;

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

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  companyId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobRequirementInput)
  requirements?: JobRequirementInput[];

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

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
