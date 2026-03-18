import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class GenerateDownloadUrlDTO {
  @IsString()
  @IsNotEmpty()
  fileKey!: string; // S3 object key (e.g., "resumes/abc-123.pdf")

  @IsOptional()
  @IsNumber()
  @Min(60) // Minimum 1 minute
  expiresIn?: number; // Optional: URL expiry in seconds (default: 3600 = 1 hour)
}
