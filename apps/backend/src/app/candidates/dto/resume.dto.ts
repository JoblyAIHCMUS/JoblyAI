import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class QueryResumeDto {
  @Expose()
  @IsNumber()
  id!: number;

  @Expose()
  @IsString()
  @IsOptional()
  fileKey?: string; // S3 object key (e.g., "resumes/uuid.pdf")

  @Expose()
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @Expose()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  parsedText?: string | null;

  @Expose()
  @IsOptional()
  @IsNumber()
  aiScore?: number | null;

  @Expose()
  @IsOptional()
  aiFeedback?: any | null;

  @Expose()
  @IsBoolean()
  isSyncedToProfile!: boolean;

  @Expose()
  @IsString()
  createdAt!: string;

  @Expose()
  @IsString()
  updatedAt!: string;
}

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  fileKey!: string; // S3 object key (e.g., "resumes/uuid.pdf")

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @IsNumber()
  @IsNotEmpty()
  fileSize!: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateResumeDto {
  @Type(() => Number)
  @IsNumber()
  id!: number;

  @IsString()
  @IsOptional()
  fileKey?: string; // Only if updating the file

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
