import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { S3Folder } from '../s3.interface';

export class GenerateUploadUrlDTO {
  @IsString()
  @IsNotEmpty()
  fileName!: string; // resume.pdf

  @IsString()
  @IsNotEmpty()
  fileType!: string; // MIME type (application/pdf)

  @IsOptional()
  @IsEnum(S3Folder)
  folder?: S3Folder;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  maxSizeMB?: number;
}
