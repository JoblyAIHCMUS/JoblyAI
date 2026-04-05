import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating employer avatar
 *
 * Flow:
 * 1. Frontend calls GET /s3/presigned-upload with fileType (image/jpeg|png|webp) and folder: 'avatars'
 * 2. Frontend uploads image directly to S3 using the presigned URL
 * 3. Frontend calls PATCH /employer/me/avatar with the returned fileKey and fileUrl
 * 4. Backend:
 *    - Retrieves current user's avatarUrl
 *    - Saves new file Key/URL to database
 *    - Deletes old avatar from S3 if it existed
 */
export class UpdateAvatarDto {
  @IsString()
  @IsNotEmpty()
  fileKey!: string; // S3 object key (e.g., "assets/avatars/uuid.jpg")

  @IsString()
  @IsNotEmpty()
  fileUrl!: string; // S3 public URL (e.g., "https://...amazonaws.com/assets/avatars/uuid.jpg")
}
