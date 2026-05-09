import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';

import { Degree } from '@prisma/client';

export class QueryEducationDto {
  @Expose()
  @IsNumber()
  id!: number;

  @Expose()
  @IsString()
  @IsNotEmpty()
  school!: string;

  @Expose()
  degree!: Degree;

  @Expose()
  @IsString()
  @IsNotEmpty()
  fieldOfStudy!: string;

  @Expose()
  @IsDateString()
  startDate!: string;

  @Expose()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Expose()
  @IsOptional()
  @IsString()
  grade?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsInt({ each: true })
  sourceCvIds?: number[];
}

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  school!: string;

  degree!: Degree;

  @IsString()
  @IsNotEmpty()
  fieldOfStudy!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  endDate?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateEducationDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsString()
  school?: string;

  degree?: Degree;

  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

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
  grade?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
