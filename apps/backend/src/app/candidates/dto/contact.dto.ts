import { CandidateContactType } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryContactDto {
  @Expose()
  @IsNotEmpty()
  id!: number;

  @Expose()
  @IsOptional()
  @IsEnum(CandidateContactType)
  type?: CandidateContactType;

  @Expose()
  @IsString()
  @IsNotEmpty()
  value!: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @Expose()
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
