import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
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
}
