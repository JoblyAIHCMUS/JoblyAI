import { CandidateExperienceType } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryExperienceDto {
  @Expose()
  @IsNumber()
  id!: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @Expose()
  @IsOptional()
  @IsString()
  location?: string;

  @Expose()
  @IsOptional()
  @IsEnum(CandidateExperienceType)
  type?: CandidateExperienceType;

  @Expose()
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @Expose()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsInt({ each: true })
  sourceCvIds?: number[];
}

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(CandidateExperienceType)
  type?: CandidateExperienceType;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateExperienceDto {
  @IsNumber()
  id!: number;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(CandidateExperienceType)
  type?: CandidateExperienceType;
}
