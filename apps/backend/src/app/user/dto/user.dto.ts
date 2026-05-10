import { IsOptional, IsString, IsISO8601, IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string; // ISO 8601 date string (YYYY-MM-DD)

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  // S3 Avatar - store public S3 URL directly
  @IsOptional()
  @IsString()
  avatarUrl?: string; // Public S3 URL for avatar (e.g., "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/avatars/uuid.jpg")
}
