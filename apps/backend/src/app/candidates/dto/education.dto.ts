import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Degree } from '@prisma/client';

export class QueryEducationDto {
  @IsNumber()
  id!: number;

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
  endDate?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  @Transform(({ value }: { value: any }) => (value === '' ? undefined : value))
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
  @Transform(({ value }: { value: any }) => (value === '' ? undefined : value))
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: any }) => (value === '' ? undefined : value))
  endDate?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
