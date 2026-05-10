import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryResumeDto {
  @IsString()
  @IsOptional()
  fileKey?: string; // S3 object key (e.g., "resumes/uuid.pdf")

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
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
