import { CandidateContactType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryContactDto {
  @IsNotEmpty()
  id!: number;

  @IsOptional()
  @IsEnum(CandidateContactType)
  type?: CandidateContactType;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt({ each: true })
  sourceCvIds?: number[];
}

export class CreateContactDto {
  @IsOptional()
  @IsEnum(CandidateContactType)
  type?: CandidateContactType;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateContactDto {
  @IsNotEmpty()
  id!: number;

  @IsOptional()
  @IsEnum(CandidateContactType)
  type?: CandidateContactType;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
